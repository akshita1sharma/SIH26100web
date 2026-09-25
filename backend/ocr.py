import os
import re
import tempfile

# ============================================================
# PaddleOCR compatibility settings
# ============================================================

os.environ["FLAGS_use_mkldnn"] = "0"
os.environ["FLAGS_enable_pir_api"] = "0"

from paddleocr import PaddleOCR


# ============================================================
# Initialize OCR engine
# ============================================================

ocr = PaddleOCR(
    text_detection_model_name="PP-OCRv5_mobile_det",
    text_recognition_model_name="PP-OCRv5_mobile_rec",
    use_doc_orientation_classify=False,
    use_doc_unwarping=False,
    use_textline_orientation=False,
    lang="en",
    enable_mkldnn=False
)


# ============================================================
# COMMON OCR FUNCTION
# ============================================================

def run_ocr(file_bytes: bytes, filename: str):
    """
    Run PaddleOCR on uploaded file bytes
    and return complete OCR text.
    """

    suffix = os.path.splitext(filename)[1]

    with tempfile.NamedTemporaryFile(
        delete=False,
        suffix=suffix
    ) as temp:

        temp.write(file_bytes)
        temp_path = temp.name

    try:
        result = ocr.predict(temp_path)

        texts = result[0]["rec_texts"]

        full_text = " ".join(texts)

        return full_text

    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)


# ============================================================
# GST EXTRACTION
# ============================================================

def extract_gst_fields(text: str):
    """
    Extract important GST fields from OCR text.
    """

    gstin_match = re.search(
        r"GSTIN\s+([A-Z0-9]+)",
        text,
        re.IGNORECASE
    )

    pan_match = re.search(
        r"PAN\s+([A-Z0-9]+)",
        text,
        re.IGNORECASE
    )

    legal_match = re.search(
        r"Legal\s+Name\s+(.*?)\s+4\.\s*Trade\s+Name",
        text,
        re.IGNORECASE
    )

    trade_match = re.search(
        r"Trade\s+Name\s+(.*?)(?=\s+5\.|\s+Registration)",
        text,
        re.IGNORECASE
    )

    date_match = re.search(
        r"\b\d{2}/\d{2}/\d{4}\b",
        text
    )

    return {
        "gstin": (
            gstin_match.group(1).strip()
            if gstin_match else None
        ),

        "pan": (
            pan_match.group(1).strip()
            if pan_match else None
        ),

        "legal_name": (
            legal_match.group(1).strip()
            if legal_match else None
        ),

        "trade_name": (
            trade_match.group(1).strip()
            if trade_match else None
        ),

        "registration_date": (
            date_match.group()
            if date_match else None
        )
    }


# ============================================================
# GST VERIFICATION
# ============================================================

def verify_gst_fields(fields: dict, bidder: dict):
    """
    Verify extracted GST fields against bidder master record.
    """

    issues = []

    gstin = fields.get("gstin")
    pan = fields.get("pan")
    legal_name = fields.get("legal_name")

    # --------------------------------------------------------
    # 1. GSTIN
    # --------------------------------------------------------

    if not gstin:

        issues.append("GSTIN_NOT_FOUND")

    elif not re.fullmatch(
        r"\d{2}[A-Z0-9]{13}",
        gstin.upper()
    ):

        issues.append("GSTIN_INVALID_FORMAT")

    elif bidder.get("gstin"):

        if gstin.upper() != bidder["gstin"].upper():

            issues.append("GSTIN_MISMATCH")

    # --------------------------------------------------------
    # 2. PAN
    # --------------------------------------------------------

    if not pan:

        issues.append("PAN_NOT_FOUND")

    elif not re.fullmatch(
        r"[A-Z]{5}\d{4}[A-Z]",
        pan.upper()
    ):

        issues.append("PAN_INVALID_FORMAT")

    elif bidder.get("pan"):

        if pan.upper() != bidder["pan"].upper():

            issues.append("PAN_MISMATCH")

    # --------------------------------------------------------
    # 3. Company / Legal Name
    # --------------------------------------------------------

    if not legal_name:

        issues.append("LEGAL_NAME_NOT_FOUND")

    elif bidder.get("company_name"):

        document_name = " ".join(
            legal_name.upper().split()
        )

        bidder_name = " ".join(
            bidder["company_name"].upper().split()
        )

        if document_name != bidder_name:

            issues.append("COMPANY_NAME_MISMATCH")

    # --------------------------------------------------------
    # Final status
    # --------------------------------------------------------

    if issues:

        status = "INVALID"

    else:

        status = "VALID"

    return {
        "status": status,
        "issues": issues,
        "issue_count": len(issues)
    }


# ============================================================
# GST RISK CALCULATION
# ============================================================

def calculate_gst_risk(verification: dict):
    """
    Calculate GST compliance score and risk level.
    """

    issues = verification.get("issues", [])

    # --------------------------------------------------------
    # No issues
    # --------------------------------------------------------

    if not issues:

        return {
            "score": 100,
            "risk_level": "LOW",
            "ai_recommendation": (
                "GST document is valid and all verified "
                "fields match the bidder records."
            )
        }

    # --------------------------------------------------------
    # Calculate score
    # --------------------------------------------------------

    serious_issues = {
        "GSTIN_MISMATCH",
        "PAN_MISMATCH",
        "COMPANY_NAME_MISMATCH"
    }

    score = 100

    for issue in issues:

        if issue in serious_issues:

            score -= 30

        elif issue in {
            "GSTIN_INVALID_FORMAT",
            "PAN_INVALID_FORMAT"
        }:

            score -= 25

        else:

            score -= 15

    score = max(score, 0)

    # --------------------------------------------------------
    # Risk level
    # --------------------------------------------------------

    if score >= 80:

        risk_level = "LOW"

    elif score >= 60:

        risk_level = "MEDIUM"

    elif score >= 30:

        risk_level = "HIGH"

    else:

        risk_level = "CRITICAL"

    # --------------------------------------------------------
    # Recommendation
    # --------------------------------------------------------

    recommendation = (
        "Manual review recommended. "
        + ", ".join(
            issue.replace("_", " ")
            for issue in issues
        )
        + " detected."
    )

    return {
        "score": score,
        "risk_level": risk_level,
        "ai_recommendation": recommendation
    }


# ============================================================
# PAN EXTRACTION
# ============================================================

def extract_pan_fields(text: str):
    """
    Extract PAN number and PAN holder name
    from PAN document OCR text.

    Example OCR:

    Permanent Account Number Card
    ABCDE1234F
    /Name RAHUL SHARMA
    /Father's Name SURESH SHARMA
    """

    text_upper = text.upper()

    # --------------------------------------------------------
    # 1. PAN number
    # --------------------------------------------------------

    pan_match = re.search(
        r"\b[A-Z]{5}[0-9]{4}[A-Z]\b",
        text_upper
    )

    pan = (
        pan_match.group(0)
        if pan_match else None
    )

    # --------------------------------------------------------
    # 2. PAN holder name
    # --------------------------------------------------------

    name = None

    # Pattern:
    #
    # /NAME RAHUL SHARMA /FATHER'S NAME
    #
    # Also handles:
    #
    # /Name Rahul Sharma F/Father's Name

    name_match = re.search(
        r"/NAME\s+(.+?)\s+(?:/|F/)?FATHER[\'’]?S\s+NAME",
        text_upper
    )

    if name_match:

        name = " ".join(
            name_match.group(1).split()
        ).strip()

    # --------------------------------------------------------
    # Fallback pattern
    # --------------------------------------------------------

    if not name:

        fallback_match = re.search(
            r"\bNAME\s*[:\-]?\s*"
            r"(.+?)"
            r"\s+(?:F/)?FATHER[\'’]?S\s+NAME",
            text_upper
        )

        if fallback_match:

            name = " ".join(
                fallback_match.group(1).split()
            ).strip()

    return {
        "pan": pan,
        "name": name
    }


# ============================================================
# PAN VERIFICATION
# ============================================================

def verify_pan_fields(fields: dict, bidder: dict):
    """
    Verify extracted PAN against bidder master record.
    """

    issues = []

    extracted_pan = fields.get("pan")
    extracted_name = fields.get("name")

    bidder_pan = (
        bidder.get("pan") or ""
    ).strip().upper()

    # --------------------------------------------------------
    # 1. PAN missing
    # --------------------------------------------------------

    if not extracted_pan:

        issues.append("PAN_NOT_EXTRACTED")

    # --------------------------------------------------------
    # 2. PAN format
    # --------------------------------------------------------

    elif not re.fullmatch(
        r"[A-Z]{5}[0-9]{4}[A-Z]",
        extracted_pan.upper()
    ):

        issues.append("PAN_INVALID_FORMAT")

    # --------------------------------------------------------
    # 3. PAN mismatch
    # --------------------------------------------------------

    if extracted_pan and bidder_pan:

        if extracted_pan.upper() != bidder_pan:

            issues.append("PAN_MISMATCH")

    # --------------------------------------------------------
    # 4. Name extraction
    # --------------------------------------------------------
    #
    # We DO NOT compare PAN holder name with company_name.
    #
    # Reason:
    # A PAN holder can be an individual/proprietor/director,
    # while bidder.company_name can represent the business.
    #
    # Therefore, for the current MVP:
    # - extract the name
    # - report if name cannot be extracted
    # - do not mark mismatch against company_name
    #
    # Later we can add a separate `pan_name` field to bidders.
    # --------------------------------------------------------

    if not extracted_name:

        issues.append("NAME_NOT_EXTRACTED")

    # --------------------------------------------------------
    # Final status
    # --------------------------------------------------------

    if any(
        issue in issues
        for issue in [
            "PAN_INVALID_FORMAT",
            "PAN_MISMATCH"
        ]
    ):

        status = "INVALID"

    elif issues:

        status = "NEEDS_REVIEW"

    else:

        status = "VALID"

    return {
        "status": status,
        "issues": issues,
        "issue_count": len(issues)
    }


# ============================================================
# PAN RISK CALCULATION
# ============================================================

def calculate_pan_risk(verification: dict):
    """
    Calculate PAN compliance score and risk.
    """

    issues = verification.get(
        "issues",
        []
    )

    # --------------------------------------------------------
    # No issues
    # --------------------------------------------------------

    if not issues:

        return {
            "score": 100,
            "risk_level": "LOW",
            "ai_recommendation": (
                "PAN document is valid and the PAN number "
                "matches the bidder record."
            )
        }

    # --------------------------------------------------------
    # PAN mismatch
    # --------------------------------------------------------

    if "PAN_MISMATCH" in issues:

        return {
            "score": 40,
            "risk_level": "HIGH",
            "ai_recommendation": (
                "PAN document does not match the bidder "
                "PAN record. Manual verification is required."
            )
        }

    # --------------------------------------------------------
    # PAN not extracted
    # --------------------------------------------------------

    if "PAN_NOT_EXTRACTED" in issues:

        return {
            "score": 30,
            "risk_level": "HIGH",
            "ai_recommendation": (
                "PAN number could not be extracted from "
                "the document. Manual verification is required."
            )
        }

    # --------------------------------------------------------
    # Invalid PAN format
    # --------------------------------------------------------

    if "PAN_INVALID_FORMAT" in issues:

        return {
            "score": 30,
            "risk_level": "HIGH",
            "ai_recommendation": (
                "PAN number format is invalid. "
                "Manual verification is required."
            )
        }

    # --------------------------------------------------------
    # Name not extracted
    # --------------------------------------------------------

    if "NAME_NOT_EXTRACTED" in issues:

        return {
            "score": 70,
            "risk_level": "MEDIUM",
            "ai_recommendation": (
                "PAN number was verified, but the PAN holder "
                "name could not be extracted. Manual review "
                "is recommended."
            )
        }

    # --------------------------------------------------------
    # Generic review
    # --------------------------------------------------------

    return {
        "score": 70,
        "risk_level": "MEDIUM",
        "ai_recommendation": (
            "PAN document requires manual review."
        )
    }

# ============================================================
# UDYAM EXTRACTION
# ============================================================

def extract_udyam_fields(text: str):
    text_upper = text.upper()

    # Udyam Registration Number
    udyam_match = re.search(
        r'UDYAM[-\s]?[A-Z]{2}[-\s]?[0-9]{2}[-\s]?[0-9]{7}',
        text_upper
    )

    udyam_number = None

    if udyam_match:
        udyam_number = (
            udyam_match.group(0)
            .replace(" ", "")
            .upper()
        )

    # Enterprise Name
    enterprise_match = re.search(
        r'NAME\s+OF\s+ENTERPRISE\s+(.+?)'
        r'\s+TYPE\s+OF\s+ENTERPRISE',
        text_upper
    )

    enterprise_name = None

    if enterprise_match:
        enterprise_name = " ".join(
            enterprise_match.group(1).split()
        ).strip()

    # Enterprise Type
    enterprise_type_match = re.search(
        r'TYPE\s+OF\s+ENTERPRISE\s+(.+?)'
        r'\s+MAJOR\s+ACTIVITY',
        text_upper
    )

    enterprise_type = None

    if enterprise_type_match:
        enterprise_type = " ".join(
            enterprise_type_match.group(1).split()
        ).strip()

    # Major Activity
    activity_match = re.search(
        r'MAJOR\s+ACTIVITY\s+(.+?)'
        r'\s+SOCIAL\s+CATEGORY',
        text_upper
    )

    major_activity = None

    if activity_match:
        major_activity = " ".join(
            activity_match.group(1).split()
        ).strip()

    # Social Category
    category_match = re.search(
        r'SOCIAL\s+CATEGORY\s+(.+?)'
        r'\s+DATE\s+OF\s+REGISTRATION',
        text_upper
    )

    social_category = None

    if category_match:
        social_category = " ".join(
            category_match.group(1).split()
        ).strip()

    # Registration Date
    registration_match = re.search(
        r'DATE\s+OF\s+REGISTRATION\s+'
        r'(\d{2}/\d{2}/\d{4})',
        text_upper
    )

    date_of_registration = (
        registration_match.group(1)
        if registration_match
        else None
    )

    # Status
    status = None

    cancelled_match = re.search(
        r'STATUS\s+CANCELLED'
        r'(?:\s*\(.*?\))?',
        text_upper
    )

    if cancelled_match:
        status = "CANCELLED"
    else:
        active_match = re.search(
            r'STATUS\s+ACTIVE',
            text_upper
        )

        if active_match:
            status = "ACTIVE"

    return {
        "udyam_number": udyam_number,
        "enterprise_name": enterprise_name,
        "enterprise_type": enterprise_type,
        "major_activity": major_activity,
        "social_category": social_category,
        "date_of_registration": date_of_registration,
        "status": status
    }

def extract_itr_fields(text: str):
    text_upper = text.upper()

    # PAN
    pan_match = re.search(
        r'\b[A-Z]{5}[0-9]{4}[A-Z]\b',
        text_upper
    )

    pan = pan_match.group(0) if pan_match else None

    # Name
    name_match = re.search(
        r'NAME\s+(.+?)\s+FATHER[\'’]S\s+NAME',
        text_upper
    )

    name = None

    if name_match:
        name = " ".join(
            name_match.group(1).split()
        ).strip()

    # Assessment Year
    assessment_match = re.search(
        r'ASSESSMENT\s+YEAR\s+(?:OF\s+INCOME\s+TAX\s+RETURN\s+)?([0-9]{4}\s*-\s*[0-9]{2})',
        text_upper
    )
    
    assessment_year = (
        assessment_match.group(1).replace(" ", "")
        if assessment_match
        else None
    )

    # Date of Filing
    filing_date_match = re.search(
        r'DATE\s+OF\s+FILING\s+(\d{2}-\d{2}-\d{4})',
        text_upper
    )

    filing_date = (
        filing_date_match.group(1)
        if filing_date_match
        else None
    )

    # Total Income
    income_match = re.search(
        r'TOTAL\s+INCOME\s+([0-9,]+)',
        text_upper
    )

    total_income = (
        income_match.group(1)
        if income_match
        else None
    )

    # Tax Paid
    tax_match = re.search(
        r'TAX\s+PAID\s+([0-9,]+)',
        text_upper
    )

    tax_paid = (
        tax_match.group(1)
        if tax_match
        else None
    )

    # Verification Status
    verification_match = re.search(
        r'VERIFICATION\s+STATUS\s+(.+?)(?=\s+THIS\s+IS|\s+THIS\s+IS\s+A|$)',
        text_upper
    )

    verification_status = None

    if verification_match:
        verification_status = " ".join(
            verification_match.group(1).split()
        ).strip()

    return {
        "pan": pan,
        "name": name,
        "assessment_year": assessment_year,
        "filing_date": filing_date,
        "total_income": total_income,
        "tax_paid": tax_paid,
        "verification_status": verification_status
    }

def verify_itr_fields(fields: dict, bidder: dict):
    issues = []

    extracted_pan = fields.get("pan")
    bidder_pan = (bidder.get("pan") or "").strip().upper()

    name = fields.get("name")
    assessment_year = fields.get("assessment_year")
    filing_date = fields.get("filing_date")
    verification_status = fields.get("verification_status")

    # PAN check
    if not extracted_pan:
        issues.append("PAN_NOT_EXTRACTED")
    elif not re.fullmatch(
        r"[A-Z]{5}[0-9]{4}[A-Z]",
        extracted_pan.upper()
    ):
        issues.append("PAN_INVALID_FORMAT")

    if extracted_pan and bidder_pan:
        if extracted_pan.upper() != bidder_pan:
            issues.append("PAN_MISMATCH")

    # Name check
    if not name:
        issues.append("NAME_NOT_EXTRACTED")

    # Assessment Year
    if not assessment_year:
        issues.append("ASSESSMENT_YEAR_NOT_EXTRACTED")

    # Filing Date
    if not filing_date:
        issues.append("FILING_DATE_NOT_EXTRACTED")

    # E-verification status
    if not verification_status:
        issues.append("VERIFICATION_STATUS_NOT_EXTRACTED")
    elif "SUCCESSFULLY E-VERIFIED" not in verification_status:
        issues.append("ITR_NOT_E_VERIFIED")

    # Final status
    if any(
        issue in issues
        for issue in [
            "PAN_INVALID_FORMAT",
            "PAN_MISMATCH",
            "ITR_NOT_E_VERIFIED"
        ]
    ):
        status = "INVALID"

    elif issues:
        status = "NEEDS_REVIEW"

    else:
        status = "VALID"

    return {
        "status": status,
        "issues": issues,
        "issue_count": len(issues)
    }

def calculate_itr_risk(verification: dict):
    issues = verification["issues"]

    if not issues:
        return {
            "score": 100,
            "risk_level": "LOW",
            "ai_recommendation": "Income Tax Return is valid and successfully e-verified."
        }

    score = 100

    for issue in issues:
        if issue == "PAN_MISMATCH":
            score -= 60
        elif issue in [
            "PAN_INVALID_FORMAT",
            "ITR_NOT_E_VERIFIED"
        ]:
            score -= 50
        else:
            score -= 15

    score = max(score, 0)

    if score >= 80:
        risk_level = "LOW"
    elif score >= 60:
        risk_level = "MEDIUM"
    elif score >= 30:
        risk_level = "HIGH"
    else:
        risk_level = "CRITICAL"

    return {
        "score": score,
        "risk_level": risk_level,
        "ai_recommendation": (
            "Income Tax verification requires review due to: "
            + ", ".join(issues)
        )
    }

def verify_udyam_fields(fields: dict, bidder: dict):
    issues = []

    udyam_number = fields.get("udyam_number")
    enterprise_name = fields.get("enterprise_name")
    status = fields.get("status")

    bidder_name = (bidder.get("company_name") or "").strip().upper()

    # Udyam number check
    if not udyam_number:
        issues.append("UDYAM_NUMBER_NOT_EXTRACTED")
    elif not re.fullmatch(
        r"UDYAM-[A-Z]{2}-[0-9]{2}-[0-9]{7}",
        udyam_number.upper()
    ):
        issues.append("UDYAM_NUMBER_INVALID_FORMAT")

    # Enterprise name check
    if not enterprise_name:
        issues.append("ENTERPRISE_NAME_NOT_EXTRACTED")
    elif bidder_name:
        if enterprise_name.upper() != bidder_name:
            issues.append("ENTERPRISE_NAME_MISMATCH")

    # Status check
    if status == "CANCELLED":
        issues.append("UDYAM_CANCELLED")

    # Final status
    if any(
        issue in issues
        for issue in [
            "UDYAM_NUMBER_INVALID_FORMAT",
            "ENTERPRISE_NAME_MISMATCH",
            "UDYAM_CANCELLED"
        ]
    ):
        verification_status = "INVALID"

    elif issues:
        verification_status = "NEEDS_REVIEW"

    else:
        verification_status = "VALID"

    return {
        "status": verification_status,
        "issues": issues,
        "issue_count": len(issues)
    }

def calculate_udyam_risk(verification: dict):
    issues = verification["issues"]

    if not issues:
        return {
            "score": 100,
            "risk_level": "LOW",
            "ai_recommendation": "Udyam certificate is valid and compliant."
        }

    score = 100

    for issue in issues:
        if issue == "UDYAM_CANCELLED":
            score -= 60
        elif issue in [
            "UDYAM_NUMBER_INVALID_FORMAT",
            "ENTERPRISE_NAME_MISMATCH"
        ]:
            score -= 40
        else:
            score -= 15

    score = max(score, 0)

    if score >= 80:
        risk_level = "LOW"
    elif score >= 60:
        risk_level = "MEDIUM"
    elif score >= 30:
        risk_level = "HIGH"
    else:
        risk_level = "CRITICAL"

    return {
        "score": score,
        "risk_level": risk_level,
        "ai_recommendation": (
            "Udyam verification requires review due to: "
            + ", ".join(issues)
        )
    }

def calculate_overall_compliance(results: list):
    if not results:
        return {
            "overall_score": 0,
            "risk_level": "UNKNOWN",
            "overall_status": "NO_DATA",
            "issues": [],
            "recommendation": "No verification results available."
        }

    scores = []
    all_issues = []

    for result in results:
        score = result.get("score")

        if score is not None:
            scores.append(float(score))

        issues = result.get("issues") or []

        if isinstance(issues, str):
            if issues.strip():
                all_issues.extend(
                    issue.strip()
                    for issue in issues.split(",")
                    if issue.strip()
                )
        elif isinstance(issues, list):
            all_issues.extend(issues)

    overall_score = round(sum(scores) / len(scores), 2) if scores else 0

    # Risk level
    if overall_score >= 80:
        risk_level = "LOW"
    elif overall_score >= 60:
        risk_level = "MEDIUM"
    elif overall_score >= 30:
        risk_level = "HIGH"
    else:
        risk_level = "CRITICAL"

    # Overall status
    if any(
        result.get("verification_status") == "INVALID"
        for result in results
    ):
        overall_status = "NON_COMPLIANT"
    elif any(
        result.get("verification_status") == "NEEDS_REVIEW"
        for result in results
    ):
        overall_status = "NEEDS_REVIEW"
    else:
        overall_status = "COMPLIANT"

    # Recommendation
    if overall_status == "COMPLIANT":
        recommendation = (
            "Bidder is compliant across the verified documents."
        )
    elif overall_status == "NEEDS_REVIEW":
        recommendation = (
            "Some compliance checks require manual review."
        )
    else:
        recommendation = (
            "Bidder has one or more non-compliant verification results. "
            "Procurement Officer review is required."
        )

    return {
        "overall_score": overall_score,
        "risk_level": risk_level,
        "overall_status": overall_status,
        "issues": list(set(all_issues)),
        "recommendation": recommendation
    }
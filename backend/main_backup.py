import os
from datetime import date
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from ocr import (
    run_ocr,
    extract_gst_fields,
    verify_gst_fields,
    calculate_gst_risk,
    extract_pan_fields,
    verify_pan_fields,
    calculate_pan_risk,
    extract_udyam_fields,
    verify_udyam_fields,
    calculate_udyam_risk,
    extract_itr_fields,
    verify_itr_fields,
    calculate_itr_risk,
    calculate_overall_compliance
)
from supabase import create_client, Client

load_dotenv()
app = FastAPI(title="SIH26100 GeM Compliance API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase: Client = create_client(
    SUPABASE_URL,
    SUPABASE_KEY
)


@app.get("/")
def root():
    return {
        "message": "SIH26100 Backend is running"
    }


@app.get("/supabase-test")
def supabase_test():
    try:
        response = supabase.table("tenders").select("*").limit(1).execute()

        return {
            "supabase_connected": True,
            "data": response.data
        }

    except Exception as e:
        return {
            "supabase_connected": False,
            "error": str(e)
        }

from pydantic import BaseModel


class TenderCreate(BaseModel):
    tender_number: str
    title: str
    description: str
    submission_deadline: str
    status: str = "OPEN"


class TenderEligibilityCreate(BaseModel):
    minimum_experience_years: float = 0
    minimum_annual_turnover: float = 0
    gst_required: bool = True
    pan_required: bool = True
    udyam_required: bool = True
    other_requirements: list[str] = []


class TenderItemCreate(BaseModel):
    item_name: str
    description: str = ""
    material: str = ""
    specifications: dict = {}
    quantity: float = 1
    unit: str = "UNIT"
    estimated_price: float | None = None
    mandatory_requirements: list[str] = []


class BidderProductCreate(BaseModel):
    tender_id: int
    item_id: int
    bidder_id: int
    product_name: str
    description: str = ""
    material: str = ""
    quantity: float = 1
    price: float = 0
    specifications: dict = {}
    image_url: str | None = None


class BidSubmissionItemCreate(BaseModel):
    item_id: int
    quoted_price: float
    specifications: str
    delivery_time: str


class BidSubmissionCreate(BaseModel):
    bidder_id: int
    tender_id: int
    declaration_confirmed: bool
    items: list[BidSubmissionItemCreate]


@app.post("/tenders")
def create_tender(tender: TenderCreate):
    response = (
        supabase
        .table("tenders")
        .insert({
            "tender_number": tender.tender_number,
            "title": tender.title,
            "description": tender.description,
            "submission_deadline": tender.submission_deadline,
            "status": tender.status
        })
        .execute()
    )

    return {
        "success": True,
        "tender": response.data
    }


@app.get("/tenders")
def get_tenders():
    response = (
        supabase
        .table("tenders")
        .select("*")
        .order("created_at", desc=True)
        .execute()
    )

    return {
        "success": True,
        "tenders": response.data
    }
@app.get("/tenders/{tender_id}/eligibility")
def get_tender_eligibility(tender_id: int):

    response = (
        supabase
        .table("tender_eligibility_requirements")
        .select("*")
        .eq("tender_id", tender_id)
        .limit(1)
        .execute()
    )

    return {
        "success": True,
        "tender_id": tender_id,
        "eligibility": (response.data or [None])[0]
    }

@app.post("/tenders/{tender_id}/eligibility")
def create_tender_eligibility(tender_id: int, eligibility: TenderEligibilityCreate):
    response = (
        supabase
        .table("tender_eligibility_requirements")
        .upsert({
            "tender_id": tender_id,
            "minimum_experience_years": eligibility.minimum_experience_years,
            "minimum_annual_turnover": eligibility.minimum_annual_turnover,
            "gst_required": eligibility.gst_required,
            "pan_required": eligibility.pan_required,
            "udyam_required": eligibility.udyam_required,
            "other_requirements": eligibility.other_requirements
        }, on_conflict="tender_id")
        .execute()
    )
    return {"success": True, "eligibility": response.data}


@app.post("/tenders/{tender_id}/items")
def create_tender_item(tender_id: int, item: TenderItemCreate):
    response = (
        supabase
        .table("tender_items")
        .insert({
            "tender_id": tender_id,
            "item_name": item.item_name,
            "description": item.description,
            "material": item.material,
            "specifications": item.specifications,
            "quantity": item.quantity,
            "unit": item.unit,
            "estimated_price": item.estimated_price,
            "mandatory_requirements": item.mandatory_requirements
        })
        .execute()
    )
    return {"success": True, "item": response.data}


@app.post("/tenders/{tender_id}/items/bulk")
def create_tender_items_bulk(tender_id: int, items: list[TenderItemCreate]):
    if not items:
        raise HTTPException(status_code=400, detail="At least one tender item is required.")

    payload = [
        {
            "tender_id": tender_id,
            "item_name": item.item_name,
            "description": item.description,
            "material": item.material,
            "specifications": item.specifications,
            "quantity": item.quantity,
            "unit": item.unit,
            "estimated_price": item.estimated_price,
            "mandatory_requirements": item.mandatory_requirements
        }
        for item in items
    ]
    response = supabase.table("tender_items").insert(payload).execute()
    return {"success": True, "tender_id": tender_id, "items": response.data}


@app.get("/tenders/{tender_id}/items")
def get_tender_items(tender_id: int):
    response = (
        supabase
        .table("tender_items")
        .select("*")
        .eq("tender_id", tender_id)
        .order("id")
        .execute()
    )
    return {"success": True, "tender_id": tender_id, "items": response.data}


@app.get("/tenders/{tender_id}/details")
def get_tender_details(tender_id: int):
    tender_response = (
        supabase.table("tenders").select("*").eq("id", tender_id).single().execute()
    )
    eligibility_response = (
        supabase.table("tender_eligibility_requirements")
        .select("*").eq("tender_id", tender_id).limit(1).execute()
    )
    items_response = (
        supabase.table("tender_items").select("*").eq("tender_id", tender_id).order("id").execute()
    )
    return {
        "success": True,
        "tender": tender_response.data,
        "eligibility": (eligibility_response.data or [None])[0],
        "items": items_response.data or []
    }


@app.post("/bidder-products")
def create_bidder_product(product: BidderProductCreate):
    # Basic relation check so a product cannot silently point to an item from another tender.
    item_response = (
        supabase.table("tender_items").select("id, tender_id")
        .eq("id", product.item_id).single().execute()
    )
    item = item_response.data
    if not item or item["tender_id"] != product.tender_id:
        raise HTTPException(status_code=400, detail="Item does not belong to the supplied tender.")

    response = (
        supabase.table("bidder_products").insert({
            "tender_id": product.tender_id,
            "item_id": product.item_id,
            "bidder_id": product.bidder_id,
            "product_name": product.product_name,
            "description": product.description,
            "material": product.material,
            "quantity": product.quantity,
            "price": product.price,
            "specifications": product.specifications,
            "image_url": product.image_url
        }).execute()
    )
    return {"success": True, "product": response.data}


@app.get("/tenders/{tender_id}/bidder-products")
def get_bidder_products(tender_id: int, bidder_id: int | None = None):
    query = supabase.table("bidder_products").select("*").eq("tender_id", tender_id)
    if bidder_id is not None:
        query = query.eq("bidder_id", bidder_id)
    response = query.order("created_at", desc=True).execute()
    return {"success": True, "tender_id": tender_id, "products": response.data}


def _normalise(value):
    return str(value).strip().lower().replace(" ", "")
def calculate_document_validity(valid_until, soon_days: int = 30):
    """
    Calculate document validity based on its expiry date.

    Returns:
        VALID
        EXPIRING_SOON
        EXPIRED
        NOT_AVAILABLE
    """

    if not valid_until:
        return "NOT_AVAILABLE"

    try:
        expiry_date = date.fromisoformat(str(valid_until)[:10])
    except (ValueError, TypeError):
        return "NOT_AVAILABLE"

    today = date.today()
    days_remaining = (expiry_date - today).days

    if days_remaining < 0:
        return "EXPIRED"

    if days_remaining <= soon_days:
        return "EXPIRING_SOON"

    return "VALID"

def compare_product_with_item(item: dict, product: dict):
    required = item.get("specifications") or {}
    provided = product.get("specifications") or {}
    checks = []

    for key, required_value in required.items():
        provided_value = provided.get(key)
        if provided_value is None:
            checks.append({"field": key, "required": required_value, "provided": None, "status": "MISMATCH"})
        elif _normalise(provided_value) == _normalise(required_value):
            checks.append({"field": key, "required": required_value, "provided": provided_value, "status": "MATCH"})
        else:
            checks.append({"field": key, "required": required_value, "provided": provided_value, "status": "PARTIAL"})

    if item.get("material"):
        status = "MATCH" if _normalise(product.get("material", "")) == _normalise(item["material"]) else "MISMATCH"
        checks.append({"field": "material", "required": item["material"], "provided": product.get("material", ""), "status": status})

    if item.get("quantity") is not None:
        status = "MATCH" if float(product.get("quantity", 0)) >= float(item["quantity"]) else "MISMATCH"
        checks.append({"field": "quantity", "required": item["quantity"], "provided": product.get("quantity", 0), "status": status})

    mandatory = item.get("mandatory_requirements") or []
    text = " ".join([
        str(product.get("product_name", "")),
        str(product.get("description", "")),
        str(product.get("specifications", {}))
    ]).lower()
    for requirement in mandatory:
        status = "MATCH" if str(requirement).lower() in text else "REVIEW"
        checks.append({"field": "mandatory_requirement", "required": requirement, "provided": text, "status": status})

    if not checks:
        score = 100
    else:
        points = {"MATCH": 100, "PARTIAL": 60, "REVIEW": 50, "MISMATCH": 0}
        score = round(sum(points[c["status"]] for c in checks) / len(checks), 2)

    if any(c["status"] == "MISMATCH" for c in checks):
        status = "MISMATCH"
    elif any(c["status"] in ["PARTIAL", "REVIEW"] for c in checks):
        status = "PARTIAL"
    else:
        status = "MATCH"

    risk = "LOW" if score >= 80 else "MEDIUM" if score >= 50 else "HIGH"
    return {"status": status, "score": score, "risk_level": risk, "checks": checks}

# ============================================================
# BID-LEVEL COMPLIANCE ENGINE
# ============================================================

def evaluate_bid_compliance(
    bidder_id: int,
    tender_id: int,
    selected_item_ids: list[int] | None = None
):
    """
    Evaluate a bidder's overall compliance for a tender.

    Checks:
    1. Tender eligibility
    2. Bidder business profile
    3. Required documents
    4. Selected tender items
    5. Product/specification compliance

    Returns:
        Overall score
        Overall status
        Risk level
        Detailed checks
        Evidence/reasons
    """

    # --------------------------------------------------------
    # 1. GET BIDDER PROFILE
    # --------------------------------------------------------

    bidder_response = (
        supabase
        .table("bidders")
        .select("*")
        .eq("id", bidder_id)
        .limit(1)
        .execute()
    )

    bidders = bidder_response.data or []

    if not bidders:
        raise HTTPException(
            status_code=404,
            detail="Bidder not found."
        )

    bidder = bidders[0]

    # --------------------------------------------------------
    # 2. GET TENDER
    # --------------------------------------------------------

    tender_response = (
        supabase
        .table("tenders")
        .select("*")
        .eq("id", tender_id)
        .limit(1)
        .execute()
    )

    tenders = tender_response.data or []

    if not tenders:
        raise HTTPException(
            status_code=404,
            detail="Tender not found."
        )

    tender = tenders[0]

    # --------------------------------------------------------
    # 3. GET ELIGIBILITY REQUIREMENTS
    # --------------------------------------------------------

    eligibility_response = (
        supabase
        .table("tender_eligibility_requirements")
        .select("*")
        .eq("tender_id", tender_id)
        .limit(1)
        .execute()
    )

    eligibility_rows = eligibility_response.data or []
    eligibility = eligibility_rows[0] if eligibility_rows else None

    # --------------------------------------------------------
    # 4. GET BIDDER DOCUMENTS
    # --------------------------------------------------------

    documents_response = (
        supabase
        .table("documents")
        .select("*")
        .eq("bidder_id", str(bidder_id))
        .execute()
    )

    documents = documents_response.data or []

    # --------------------------------------------------------
    # 5. GET LATEST VERIFICATION RESULTS
    # --------------------------------------------------------

    document_ids = [
        document["id"]
        for document in documents
        if document.get("id") is not None
    ]

    verification_results = []

    if document_ids:
        verification_response = (
            supabase
            .table("verification_results")
            .select("*")
            .in_("document_id", document_ids)
            .order("created_at", desc=True)
            .execute()
        )

        verification_results = verification_response.data or []

    latest_verification = {}

    for result in verification_results:
        document_id = result.get("document_id")

        if document_id not in latest_verification:
            latest_verification[document_id] = result

    # --------------------------------------------------------
    # 6. CREATE CHECK LIST
    # --------------------------------------------------------

    checks = []

    def add_check(
        category,
        requirement,
        status,
        score,
        reason,
        evidence=None
    ):
        checks.append({
            "category": category,
            "requirement": requirement,
            "status": status,
            "score": score,
            "reason": reason,
            "evidence": evidence
        })

    # --------------------------------------------------------
    # 7. ELIGIBILITY CHECKS
    # --------------------------------------------------------

    if eligibility:

        # ----------------------------------------------------
        # EXPERIENCE
        # ----------------------------------------------------

        required_experience = float(
            eligibility.get("minimum_experience_years") or 0
        )

        established_year = bidder.get("established_year")

        if required_experience > 0:

            if established_year:

                current_year = date.today().year

                experience_years = max(
                    0,
                    current_year - int(established_year)
                )

                if experience_years >= required_experience:

                    add_check(
                        "ELIGIBILITY",
                        f"Minimum experience: {required_experience} years",
                        "COMPLIANT",
                        100,
                        f"Bidder has approximately {experience_years} years of business experience.",
                        {
                            "required_years": required_experience,
                            "available_years": experience_years,
                            "established_year": established_year
                        }
                    )

                else:

                    add_check(
                        "ELIGIBILITY",
                        f"Minimum experience: {required_experience} years",
                        "NON_COMPLIANT",
                        0,
                        f"Bidder has approximately {experience_years} years of experience, below the required {required_experience} years.",
                        {
                            "required_years": required_experience,
                            "available_years": experience_years,
                            "established_year": established_year
                        }
                    )

            else:

                add_check(
                    "ELIGIBILITY",
                    f"Minimum experience: {required_experience} years",
                    "REVIEW",
                    50,
                    "Bidder establishment year is not available.",
                    None
                )

        # ----------------------------------------------------
        # ANNUAL TURNOVER
        # ----------------------------------------------------

        required_turnover = float(
            eligibility.get("minimum_annual_turnover") or 0
        )

        bidder_turnover = bidder.get("annual_turnover")

        if required_turnover > 0:

            if bidder_turnover is not None:

                bidder_turnover = float(bidder_turnover)

                if bidder_turnover >= required_turnover:

                    add_check(
                        "ELIGIBILITY",
                        f"Minimum annual turnover: ₹{required_turnover:,.2f}",
                        "COMPLIANT",
                        100,
                        f"Bidder turnover of ₹{bidder_turnover:,.2f} meets the tender requirement.",
                        {
                            "required_turnover": required_turnover,
                            "bidder_turnover": bidder_turnover
                        }
                    )

                else:

                    add_check(
                        "ELIGIBILITY",
                        f"Minimum annual turnover: ₹{required_turnover:,.2f}",
                        "NON_COMPLIANT",
                        0,
                        f"Bidder turnover of ₹{bidder_turnover:,.2f} is below the required ₹{required_turnover:,.2f}.",
                        {
                            "required_turnover": required_turnover,
                            "bidder_turnover": bidder_turnover
                        }
                    )

            else:

                add_check(
                    "ELIGIBILITY",
                    f"Minimum annual turnover: ₹{required_turnover:,.2f}",
                    "REVIEW",
                    50,
                    "Annual turnover is not available in the bidder profile.",
                    None
                )

        # ----------------------------------------------------
        # GST
        # ----------------------------------------------------

        if eligibility.get("gst_required"):

            gst_documents = [
                document
                for document in documents
                if str(document.get("document_type", "")).upper() == "GST"
            ]

            if not gst_documents:

                add_check(
                    "DOCUMENT",
                    "GST document required",
                    "NON_COMPLIANT",
                    0,
                    "Required GST document has not been uploaded.",
                    None
                )

            else:

                gst_document = max(
                    gst_documents,
                    key=lambda x: x.get("created_at", "")
                )

                verification = latest_verification.get(
                    gst_document.get("id")
                )

                if verification:

                    verification_status = str(
                        verification.get("verification_status") or ""
                    ).upper()

                    if verification_status in [
                        "VALID",
                        "VERIFIED",
                        "COMPLIANT",
                        "MATCH"
                    ]:

                        add_check(
                            "DOCUMENT",
                            "GST document verification",
                            "COMPLIANT",
                            100,
                            "GST document has a successful verification result.",
                            {
                                "document_id": gst_document.get("id"),
                                "verification_status": verification_status
                            }
                        )

                    else:

                        add_check(
                            "DOCUMENT",
                            "GST document verification",
                            "REVIEW",
                            50,
                            "GST document exists but its latest verification result requires review.",
                            {
                                "document_id": gst_document.get("id"),
                                "verification_status": verification_status,
                                "issues": verification.get("issues")
                            }
                        )

                else:

                    add_check(
                        "DOCUMENT",
                        "GST document verification",
                        "REVIEW",
                        50,
                        "GST document is uploaded but automatic verification is not available yet.",
                        {
                            "document_id": gst_document.get("id")
                        }
                    )

        # ----------------------------------------------------
        # PAN
        # ----------------------------------------------------

        if eligibility.get("pan_required"):

            pan_documents = [
                document
                for document in documents
                if str(document.get("document_type", "")).upper() == "PAN"
            ]

            if not pan_documents:

                add_check(
                    "DOCUMENT",
                    "PAN document required",
                    "NON_COMPLIANT",
                    0,
                    "Required PAN document has not been uploaded.",
                    None
                )

            else:

                pan_document = max(
                    pan_documents,
                    key=lambda x: x.get("created_at", "")
                )

                verification = latest_verification.get(
                    pan_document.get("id")
                )

                if verification:

                    verification_status = str(
                        verification.get("verification_status") or ""
                    ).upper()

                    if verification_status in [
                        "VALID",
                        "VERIFIED",
                        "COMPLIANT",
                        "MATCH"
                    ]:

                        add_check(
                            "DOCUMENT",
                            "PAN document verification",
                            "COMPLIANT",
                            100,
                            "PAN document has a successful verification result.",
                            {
                                "document_id": pan_document.get("id"),
                                "verification_status": verification_status
                            }
                        )

                    else:

                        add_check(
                            "DOCUMENT",
                            "PAN document verification",
                            "REVIEW",
                            50,
                            "PAN document exists but its latest verification result requires review.",
                            {
                                "document_id": pan_document.get("id"),
                                "verification_status": verification_status,
                                "issues": verification.get("issues")
                            }
                        )

                else:

                    add_check(
                        "DOCUMENT",
                        "PAN document verification",
                        "REVIEW",
                        50,
                        "PAN document is uploaded but automatic verification is not available yet.",
                        {
                            "document_id": pan_document.get("id")
                        }
                    )

        # ----------------------------------------------------
        # UDYAM
        # ----------------------------------------------------

        if eligibility.get("udyam_required"):

            udyam_documents = [
                document
                for document in documents
                if str(document.get("document_type", "")).upper() == "UDYAM"
            ]

            if not udyam_documents:

                add_check(
                    "DOCUMENT",
                    "Udyam document required",
                    "NON_COMPLIANT",
                    0,
                    "Required Udyam document has not been uploaded.",
                    None
                )

            else:

                udyam_document = max(
                    udyam_documents,
                    key=lambda x: x.get("created_at", "")
                )

                verification = latest_verification.get(
                    udyam_document.get("id")
                )

                if verification:

                    verification_status = str(
                        verification.get("verification_status") or ""
                    ).upper()

                    if verification_status in [
                        "VALID",
                        "VERIFIED",
                        "COMPLIANT",
                        "MATCH"
                    ]:

                        add_check(
                            "DOCUMENT",
                            "Udyam document verification",
                            "COMPLIANT",
                            100,
                            "Udyam document has a successful verification result.",
                            {
                                "document_id": udyam_document.get("id"),
                                "verification_status": verification_status
                            }
                        )

                    else:

                        add_check(
                            "DOCUMENT",
                            "Udyam document verification",
                            "REVIEW",
                            50,
                            "Udyam document exists but its latest verification result requires review.",
                            {
                                "document_id": udyam_document.get("id"),
                                "verification_status": verification_status,
                                "issues": verification.get("issues")
                            }
                        )

                else:

                    add_check(
                        "DOCUMENT",
                        "Udyam document verification",
                        "REVIEW",
                        50,
                        "Udyam document is uploaded but automatic verification is not available yet.",
                        {
                            "document_id": udyam_document.get("id")
                        }
                    )

    else:

        add_check(
            "ELIGIBILITY",
            "Tender eligibility requirements",
            "REVIEW",
            50,
            "No structured eligibility requirements are configured for this tender.",
            None
        )

    # --------------------------------------------------------
    # 8. GET TENDER ITEMS
    # --------------------------------------------------------

    items_response = (
        supabase
        .table("tender_items")
        .select("*")
        .eq("tender_id", tender_id)
        .order("id")
        .execute()
    )

    tender_items = items_response.data or []

    # --------------------------------------------------------
    # 9. GET ACTUAL SUBMITTED BID ITEMS
    # --------------------------------------------------------
    # The submitted bid is the source of truth for compliance.
    # Do not use bidder_products here because a bid is stored in
    # bid_submissions + bid_submission_items.

    submission_response = (
        supabase
        .table("bid_submissions")
        .select("*")
        .eq("tender_id", tender_id)
        .eq("bidder_id", bidder_id)
        .order("submitted_at", desc=True)
        .limit(1)
        .execute()
    )

    submissions = submission_response.data or []

    if not submissions:
        raise HTTPException(
            status_code=404,
            detail="No submitted bid found for this bidder and tender."
        )

    submission = submissions[0]
    submission_id = int(submission["id"])

    submitted_items_response = (
        supabase
        .table("bid_submission_items")
        .select("*")
        .eq("submission_id", submission_id)
        .execute()
    )

    submitted_items = submitted_items_response.data or []

    submitted_by_item = {
        int(item["item_id"]): item
        for item in submitted_items
    }

    # --------------------------------------------------------
    # 10. USE ONLY ITEMS ACTUALLY INCLUDED IN THE BID
    # --------------------------------------------------------

    submitted_item_ids = set(submitted_by_item.keys())

    tender_items = [
        item
        for item in tender_items
        if int(item["id"]) in submitted_item_ids
    ]

    if selected_item_ids:
        selected_set = {int(item_id) for item_id in selected_item_ids}
        tender_items = [
            item
            for item in tender_items
            if int(item["id"]) in selected_set
        ]

    # --------------------------------------------------------
    # 11. ITEM-LEVEL COMPLIANCE
    # --------------------------------------------------------

    item_results = []

    for item in tender_items:

        submitted_item = submitted_by_item.get(int(item["id"]))

        if not submitted_item:
            continue

        # Bid preparation stores specifications as free text, so compare
        # tender requirements against that submitted text rather than
        # expecting the old bidder_products JSON structure.
        provided_text = " ".join([
            str(submitted_item.get("specifications") or ""),
            str(submitted_item.get("delivery_time") or "")
        ]).lower()

        checks = []
        required_specs = item.get("specifications") or {}
        if isinstance(required_specs, dict):
            for key, required_value in required_specs.items():
                required_text = str(required_value).strip().lower()
                matched = bool(required_text) and required_text in provided_text
                checks.append({
                    "field": str(key),
                    "required": required_value,
                    "provided": submitted_item.get("specifications"),
                    "status": "MATCH" if matched else "REVIEW"
                })

        for requirement in item.get("mandatory_requirements") or []:
            requirement_text = str(requirement).strip().lower()
            matched = bool(requirement_text) and requirement_text in provided_text
            checks.append({
                "field": "mandatory_requirement",
                "required": requirement,
                "provided": submitted_item.get("specifications"),
                "status": "MATCH" if matched else "REVIEW"
            })

        if not checks:
            comparison = {
                "status": "MATCH",
                "score": 100,
                "risk_level": "LOW",
                "checks": []
            }
        else:
            points = {"MATCH": 100, "REVIEW": 50}
            score = round(
                sum(points[c["status"]] for c in checks) / len(checks),
                2
            )
            comparison = {
                "status": "MATCH" if score >= 80 else "PARTIAL",
                "score": score,
                "risk_level": "LOW" if score >= 80 else "MEDIUM",
                "checks": checks
            }

        item_status = comparison.get("status")

        if item_status == "MATCH":

            final_status = "COMPLIANT"

        elif item_status == "PARTIAL":

            final_status = "REVIEW"

        else:

            final_status = "NON_COMPLIANT"

        item_result = {
            "item_id": item["id"],
            "item_name": item.get("item_name"),
            "status": final_status,
            "score": comparison.get("score", 0),
            "risk_level": comparison.get("risk_level", "HIGH"),
            "reason": (
                "All checked product requirements match."
                if final_status == "COMPLIANT"
                else
                "Some product requirements require review."
                if final_status == "REVIEW"
                else
                "One or more product requirements do not match."
            ),
            "checks": comparison.get("checks", [])
        }

        item_results.append(item_result)

        add_check(
            "ITEM",
            f"Product compliance: {item.get('item_name')}",
            final_status,
            comparison.get("score", 0),
            item_result["reason"],
            {
                "item_id": item["id"],
                "submission_item_id": submitted_item.get("id"),
                "quoted_price": submitted_item.get("quoted_price"),
                "specifications": submitted_item.get("specifications"),
                "delivery_time": submitted_item.get("delivery_time"),
                "checks": comparison.get("checks", [])
            }
        )

    # --------------------------------------------------------
    # 12. CALCULATE OVERALL SCORE
    # --------------------------------------------------------

    if checks:

        overall_score = round(
            sum(float(check["score"]) for check in checks)
            / len(checks),
            2
        )

    else:

        overall_score = 0

    # --------------------------------------------------------
    # 13. DETERMINE OVERALL STATUS
    # --------------------------------------------------------

    if any(
        check["status"] == "NON_COMPLIANT"
        for check in checks
    ):

        overall_status = "NON_COMPLIANT"

    elif any(
        check["status"] == "REVIEW"
        for check in checks
    ):

        overall_status = "REVIEW"

    else:

        overall_status = "COMPLIANT"

    # --------------------------------------------------------
    # 14. DETERMINE RISK
    # --------------------------------------------------------

    if overall_status == "NON_COMPLIANT":

        risk_level = "HIGH"

    elif overall_score < 80:

        risk_level = "MEDIUM"

    else:

        risk_level = "LOW"

    # --------------------------------------------------------
    # 15. SUMMARY COUNTS
    # --------------------------------------------------------

    compliant_count = sum(
        1 for check in checks
        if check["status"] == "COMPLIANT"
    )

    review_count = sum(
        1 for check in checks
        if check["status"] == "REVIEW"
    )

    non_compliant_count = sum(
        1 for check in checks
        if check["status"] == "NON_COMPLIANT"
    )

    # --------------------------------------------------------
    # 16. FINAL RESULT
    # --------------------------------------------------------

    return {
        "success": True,
        "bidder_id": bidder_id,
        "tender_id": tender_id,

        "tender": {
            "id": tender.get("id"),
            "tender_number": tender.get("tender_number"),
            "title": tender.get("title"),
            "status": tender.get("status")
        },

        "submission": {
            "id": submission_id,
            "status": submission.get("status"),
            "total_amount": submission.get("total_amount"),
            "submitted_at": submission.get("submitted_at")
        },

        "bidder": {
            "id": bidder.get("id"),
            "bidder_code": bidder.get("bidder_code"),
            "company_name": bidder.get("company_name"),
            "established_year": bidder.get("established_year"),
            "annual_turnover": bidder.get("annual_turnover")
        },

        "overall_score": overall_score,
        "overall_status": overall_status,
        "risk_level": risk_level,

        "summary": {
            "total_checks": len(checks),
            "compliant": compliant_count,
            "review": review_count,
            "non_compliant": non_compliant_count
        },

        "eligibility": eligibility,

        "checks": checks,

        "item_results": item_results
    }

# ============================================================
# BID-LEVEL COMPLIANCE API
# ============================================================

@app.get("/tenders/{tender_id}/compliance/{bidder_id}")
def get_bid_compliance(
    tender_id: int,
    bidder_id: int
):
    """
    Run complete tender-level compliance evaluation
    for a bidder.
    """

    try:
        result = evaluate_bid_compliance(
            bidder_id=bidder_id,
            tender_id=tender_id
        )

        return result

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unable to evaluate bid compliance: {str(e)}"
        )

@app.get("/bid-submissions/{bid_id}/compliance")
def get_submission_compliance(bid_id: int):
    """Evaluate one concrete submitted bid using its bidder, tender and submitted items."""
    try:
        response = (
            supabase.table("bid_submissions")
            .select("*")
            .eq("id", bid_id)
            .limit(1)
            .execute()
        )
        rows = response.data or []
        if not rows:
            raise HTTPException(status_code=404, detail="Bid submission not found.")

        bid = rows[0]
        result = evaluate_bid_compliance(
            bidder_id=int(bid["bidder_id"]),
            tender_id=int(bid["tender_id"])
        )
        return {
            "success": True,
            "bid_id": bid_id,
            **result
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unable to evaluate submitted bid: {str(e)}"
        )


@app.get("/tenders/{tender_id}/product-compliance/{bidder_id}")
def get_product_compliance(tender_id: int, bidder_id: int):
    items_response = supabase.table("tender_items").select("*").eq("tender_id", tender_id).order("id").execute()
    products_response = (
        supabase.table("bidder_products").select("*")
        .eq("tender_id", tender_id).eq("bidder_id", bidder_id).execute()
    )
    products = products_response.data or []
    product_by_item = {p["item_id"]: p for p in products}

    comparisons = []
    for item in items_response.data or []:
        product = product_by_item.get(item["id"])
        comparison = compare_product_with_item(item, product) if product else {
            "status": "MISMATCH", "score": 0, "risk_level": "HIGH",
            "checks": [{"field": "product_submission", "required": "Product required", "provided": None, "status": "MISMATCH"}]
        }
        comparisons.append({"item": item, "product": product, "comparison": comparison})

    scores = [c["comparison"]["score"] for c in comparisons]
    overall_score = round(sum(scores) / len(scores), 2) if scores else 0
    overall_status = "COMPLIANT" if overall_score >= 80 else "REVIEW" if overall_score >= 50 else "NON_COMPLIANT"
    return {
        "success": True,
        "tender_id": tender_id,
        "bidder_id": bidder_id,
        "overall_score": overall_score,
        "overall_status": overall_status,
        "comparisons": comparisons
    }


class BidderCreate(BaseModel):
    bidder_code: str
    company_name: str
    gstin: str
    pan: str
    udyam_number: str


@app.post("/bidders")
def create_bidder(bidder: BidderCreate):
    response = (
        supabase
        .table("bidders")
        .insert({
            "bidder_code": bidder.bidder_code,
            "company_name": bidder.company_name,
            "gstin": bidder.gstin,
            "pan": bidder.pan,
            "udyam_number": bidder.udyam_number
        })
        .execute()
    )

    return {
        "success": True,
        "bidder": response.data
    }    

@app.get("/bidders")
def get_bidders():
    response = (
        supabase
        .table("bidders")
        .select("*")
        .order("created_at", desc=True)
        .execute()
    )

    return {
        "success": True,
        "bidders": response.data
    }


# ============================================================
# BIDDER BUSINESS PROFILE
# ============================================================

class BidderProfileUpdate(BaseModel):
    company_name: str | None = None
    business_type: str | None = None
    business_description: str | None = None
    primary_trade: str | None = None
    products_services: str | None = None
    established_year: int | None = None
    annual_turnover: float | None = None
    employee_count: int | None = None
    email: str | None = None
    phone: str | None = None
    address: str | None = None
    city: str | None = None
    state: str | None = None
    gstin: str | None = None
    pan: str | None = None
    udyam_number: str | None = None
    registration_number: str | None = None
    website: str | None = None


@app.get("/bidders/{bidder_id}/profile")
def get_bidder_profile(bidder_id: int):
    try:
        response = (
            supabase
            .table("bidders")
            .select("*")
            .eq("id", bidder_id)
            .limit(1)
            .execute()
        )
        bidders = response.data or []
        if not bidders:
            raise HTTPException(status_code=404, detail="Bidder not found.")
        return {"success": True, "profile": bidders[0]}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Profile fetch error for bidder {bidder_id}: {e}")
        raise HTTPException(status_code=500, detail="Unable to fetch bidder profile.")


@app.put("/bidders/{bidder_id}/profile")
def update_bidder_profile(bidder_id: int, profile: BidderProfileUpdate):
    try:
        update_data = profile.model_dump(exclude_unset=True)
        if not update_data:
            raise HTTPException(status_code=400, detail="No profile data provided.")

        if "established_year" in update_data and update_data["established_year"] is not None:
            year = update_data["established_year"]
            if year < 1800 or year > date.today().year:
                raise HTTPException(status_code=400, detail="Invalid established year.")

        if "annual_turnover" in update_data and update_data["annual_turnover"] is not None:
            if update_data["annual_turnover"] < 0:
                raise HTTPException(status_code=400, detail="Annual turnover cannot be negative.")

        if "employee_count" in update_data and update_data["employee_count"] is not None:
            if update_data["employee_count"] < 0:
                raise HTTPException(status_code=400, detail="Employee count cannot be negative.")

        response = (
            supabase
            .table("bidders")
            .update(update_data)
            .eq("id", bidder_id)
            .execute()
        )

        if not response.data:
            raise HTTPException(status_code=404, detail="Bidder not found or profile could not be updated.")

        return {
            "success": True,
            "message": "Business profile updated successfully.",
            "profile": response.data[0]
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Profile update error for bidder {bidder_id}: {e}")
        raise HTTPException(status_code=500, detail="Unable to update bidder profile.")


@app.post("/bidders/{bidder_id}/profile/logo")
def upload_bidder_logo(bidder_id: int, file: UploadFile = File(...)):
    try:
        bidder_response = (
            supabase
            .table("bidders")
            .select("id")
            .eq("id", bidder_id)
            .limit(1)
            .execute()
        )
        if not bidder_response.data:
            raise HTTPException(status_code=404, detail="Bidder not found.")

        filename = os.path.basename(file.filename or "logo")
        extension = os.path.splitext(filename)[1].lower()
        if extension not in {".png", ".jpg", ".jpeg", ".webp"}:
            raise HTTPException(status_code=400, detail="Logo must be PNG, JPG, JPEG, or WEBP.")

        file_bytes = file.file.read()
        if not file_bytes:
            raise HTTPException(status_code=400, detail="Logo file is empty.")
        if len(file_bytes) > 5 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Logo size must be less than 5 MB.")

        logo_path = f"bidder_{bidder_id}/profile/logo{extension}"
        supabase.storage.from_("bid-documents").upload(
            logo_path,
            file_bytes,
            {
                "content-type": file.content_type or "application/octet-stream",
                "upsert": "true"
            }
        )

        update_response = (
            supabase
            .table("bidders")
            .update({"logo_path": logo_path})
            .eq("id", bidder_id)
            .execute()
        )
        if not update_response.data:
            raise HTTPException(status_code=500, detail="Logo uploaded but bidder profile could not be updated.")

        return {
            "success": True,
            "message": "Business logo updated successfully.",
            "logo_path": logo_path,
            "profile": update_response.data[0]
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Logo upload error for bidder {bidder_id}: {e}")
        raise HTTPException(status_code=500, detail="Unable to upload business logo.")


@app.get("/documents")
def get_documents():

    response = (
        supabase
        .table("documents")
        .select("*")
        .order("created_at", desc=True)
        .execute()
    )

    documents = response.data or []

    # Calculate validity dynamically.
    # We do not UPDATE the database here.
    for document in documents:
        document["validity_status"] = calculate_document_validity(
            document.get("valid_until")
        )

    return {
        "success": True,
        "documents": documents
    }

@app.get("/bidders/{bidder_id}/document-vault")
def get_bidder_document_vault(bidder_id: int):

    # Get all documents of this bidder
    documents_response = (
        supabase
        .table("documents")
        .select("*")
        .eq("bidder_id", str(bidder_id))
        .order("created_at", desc=True)
        .execute()
    )

    documents = documents_response.data or []

    # Attach latest verification result and validity status
    for document in documents:

        document_id = document.get("id")

        # Calculate validity dynamically
        document["validity_status"] = calculate_document_validity(
            document.get("valid_until")
        )

        # Get latest verification result for this document
        if document_id:

            verification_response = (
                supabase
                .table("verification_results")
                .select("*")
                .eq("document_id", document_id)
                .order("created_at", desc=True)
                .limit(1)
                .execute()
            )

            results = verification_response.data or []

            if results:
                document["verification"] = results[0]
            else:
                document["verification"] = None

        else:
            document["verification"] = None

    return {
        "success": True,
        "bidder_id": bidder_id,
        "documents": documents
    }

@app.get("/verification-results")
def get_verification_results():
    response = (
        supabase
        .table("verification_results")
        .select("*")
        .order("created_at", desc=True)
        .execute()
    )

    return {
        "success": True,
        "verification_results": response.data
    }

# ============================================================
# AUTOMATIC DOCUMENT VERIFICATION HELPER
# ============================================================

def process_uploaded_document(
    document_id: int,
    bidder_id: int,
    document_type: str,
    file_bytes: bytes,
    filename: str
):
    """
    Background processing pipeline.

    This version only measures the time taken by each stage.
    We will use these timings to optimize the slowest stage.
    """

    import time

    total_start = time.perf_counter()

    print("\n" + "=" * 70)
    print(f"[DOC {document_id}] BACKGROUND PROCESSING STARTED")
    print(f"[DOC {document_id}] File: {filename}")
    print(f"[DOC {document_id}] Type: {document_type}")
    print("=" * 70)

    try:

        # --------------------------------------------------------
        # 1. GET BIDDER
        # --------------------------------------------------------

        step_start = time.perf_counter()

        bidder_response = (
            supabase
            .table("bidders")
            .select("*")
            .eq("id", bidder_id)
            .single()
            .execute()
        )

        bidder = bidder_response.data

        bidder_time = time.perf_counter() - step_start

        print(
            f"[DOC {document_id}] "
            f"1. Bidder fetch: {bidder_time:.2f}s"
        )

        if not bidder:
            raise ValueError("Bidder not found.")

        # --------------------------------------------------------
        # 2. OCR
        # --------------------------------------------------------

        step_start = time.perf_counter()

        print(
            f"[DOC {document_id}] "
            f"2. OCR started..."
        )

        text = run_ocr(
            file_bytes,
            filename
        )

        ocr_time = time.perf_counter() - step_start

        print(
            f"[DOC {document_id}] "
            f"2. OCR completed: {ocr_time:.2f}s"
        )

        print(
            f"[DOC {document_id}] "
            f"OCR characters extracted: {len(text)}"
        )

        # --------------------------------------------------------
        # 3. NORMALIZE DOCUMENT TYPE
        # --------------------------------------------------------

        doc_type = document_type.strip().upper()

        fields = {}
        verification = {}
        risk_result = {}

        # --------------------------------------------------------
        # 4. EXTRACTION
        # --------------------------------------------------------

        step_start = time.perf_counter()

        print(
            f"[DOC {document_id}] "
            f"3. Data extraction started..."
        )

        if doc_type == "GST":

            fields = extract_gst_fields(text)

        elif doc_type == "PAN":

            fields = extract_pan_fields(text)

        elif doc_type == "UDYAM":

            fields = extract_udyam_fields(text)

        elif doc_type in ["ITR", "INCOME TAX"]:

            fields = extract_itr_fields(text)

        else:

            print(
                f"[DOC {document_id}] "
                f"Unsupported document type: {document_type}"
            )

            return {
                "processed": False,
                "message": (
                    f"Automatic verification for "
                    f"{document_type} is not available yet."
                )
            }

        extraction_time = time.perf_counter() - step_start

        print(
            f"[DOC {document_id}] "
            f"3. Data extraction completed: "
            f"{extraction_time:.2f}s"
        )

        # --------------------------------------------------------
        # 5. VERIFICATION
        # --------------------------------------------------------

        step_start = time.perf_counter()

        print(
            f"[DOC {document_id}] "
            f"4. Verification started..."
        )

        if doc_type == "GST":

            verification = verify_gst_fields(
                fields,
                bidder
            )

        elif doc_type == "PAN":

            verification = verify_pan_fields(
                fields,
                bidder
            )

        elif doc_type == "UDYAM":

            verification = verify_udyam_fields(
                fields,
                bidder
            )

        elif doc_type in ["ITR", "INCOME TAX"]:

            verification = verify_itr_fields(
                fields,
                bidder
            )

        verification_time = time.perf_counter() - step_start

        print(
            f"[DOC {document_id}] "
            f"4. Verification completed: "
            f"{verification_time:.2f}s"
        )

        # --------------------------------------------------------
        # 6. RISK CALCULATION
        # --------------------------------------------------------

        step_start = time.perf_counter()

        print(
            f"[DOC {document_id}] "
            f"5. Risk calculation started..."
        )

        if doc_type == "GST":

            risk_result = calculate_gst_risk(
                verification
            )

        elif doc_type == "PAN":

            risk_result = calculate_pan_risk(
                verification
            )

        elif doc_type == "UDYAM":

            risk_result = calculate_udyam_risk(
                verification
            )

        elif doc_type in ["ITR", "INCOME TAX"]:

            risk_result = calculate_itr_risk(
                verification
            )

        risk_time = time.perf_counter() - step_start

        print(
            f"[DOC {document_id}] "
            f"5. Risk calculation completed: "
            f"{risk_time:.2f}s"
        )

        # --------------------------------------------------------
        # 7. SAVE VERIFICATION RESULT
        # --------------------------------------------------------

        step_start = time.perf_counter()

        print(
            f"[DOC {document_id}] "
            f"6. Saving verification result..."
        )

        result = (
            supabase
            .table("verification_results")
            .insert({
                "document_id": document_id,
                "verification_status": verification["status"],
                "issues": ", ".join(
                    verification["issues"]
                ),
                "score": risk_result["score"],
                "risk_level": risk_result["risk_level"],
                "ai_recommendation": risk_result[
                    "ai_recommendation"
                ],
                "extracted_fields": fields
            })
            .execute()
        )

        db_time = time.perf_counter() - step_start

        print(
            f"[DOC {document_id}] "
            f"6. Verification DB save completed: "
            f"{db_time:.2f}s"
        )

# --------------------------------------------------------
# 8. DOCUMENT STATUS UPDATE
# --------------------------------------------------------
# We do not update the documents table here because
# the current Supabase role does not have UPDATE permission.
# Verification status is tracked through verification_results.

        status_time = 0.0

        print(
        f"[DOC {document_id}] "
        f"7. Document status update skipped "
        f"(using verification_results as source of truth)"
        )
        f"Status update     : {status_time:.2f}s"
  
        # --------------------------------------------------------
        # TOTAL TIME
        # --------------------------------------------------------

        total_time = time.perf_counter() - total_start

        print("\n" + "-" * 70)
        print(
            f"[DOC {document_id}] PROCESSING COMPLETE"
        )
        print("-" * 70)

        print(
            f"[DOC {document_id}] "
            f"Bidder fetch      : {bidder_time:.2f}s"
        )

        print(
            f"[DOC {document_id}] "
            f"OCR               : {ocr_time:.2f}s"
        )

        print(
            f"[DOC {document_id}] "
            f"Extraction        : {extraction_time:.2f}s"
        )

        print(
            f"[DOC {document_id}] "
            f"Verification      : {verification_time:.2f}s"
        )

        print(
            f"[DOC {document_id}] "
            f"Risk calculation  : {risk_time:.2f}s"
        )

        print(
            f"[DOC {document_id}] "
            f"Verification DB   : {db_time:.2f}s"
        )

        print(
            f"[DOC {document_id}] "
            f"Status update     : {status_time:.2f}s"
        )

        print("-" * 70)

        print(
            f"[DOC {document_id}] "
            f"TOTAL PROCESSING  : {total_time:.2f}s"
        )

        print("-" * 70 + "\n")

        # --------------------------------------------------------
        # RETURN COMPLETE RESULT
        # --------------------------------------------------------

        return {
            "processed": True,
            "ocr_text": text,
            "extracted_fields": fields,
            "verification": verification,
            "risk_assessment": risk_result,
            "saved_result": result.data,
            "processing_time_seconds": round(
                total_time,
                2
            )
        }

    except Exception as e:

        total_time = time.perf_counter() - total_start

        print("\n" + "!" * 70)
        print(
            f"[DOC {document_id}] PROCESSING FAILED"
        )
        print(
            f"[DOC {document_id}] "
            f"Time before failure: {total_time:.2f}s"
        )
        print(
            f"[DOC {document_id}] "
            f"Error: {str(e)}"
        )
        print("!" * 70 + "\n")

        raise


# ============================================================
# UPLOAD + AUTOMATIC OCR + VERIFICATION
# ============================================================

@app.post("/documents/upload")
def upload_document(
    background_tasks: BackgroundTasks,
    bidder_id: int = Form(...),
    document_type: str = Form(...),
    file: UploadFile = File(...)
):

    # -------------------------
    # NORMALIZE INPUT
    # -------------------------
    document_type = document_type.strip().upper()

    safe_filename = os.path.basename(
        file.filename or "document"
    )

    # -------------------------
    # READ FILE
    # -------------------------
    file_bytes = file.file.read()

    if not file_bytes:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is empty."
        )

    # -------------------------
    # BASIC FILE SIZE CHECK
    # -------------------------
    max_file_size = 10 * 1024 * 1024  # 10 MB

    if len(file_bytes) > max_file_size:
        raise HTTPException(
            status_code=400,
            detail="File size must be less than 10 MB."
        )

    # -------------------------
    # FIND NEXT VERSION
    # -------------------------
    latest_response = (
        supabase
        .table("documents")
        .select("version_number")
        .eq("bidder_id", str(bidder_id))
        .eq("document_type", document_type)
        .order("version_number", desc=True)
        .limit(1)
        .execute()
    )

    latest_versions = latest_response.data or []

    if latest_versions and latest_versions[0].get("version_number"):
        next_version = latest_versions[0]["version_number"] + 1
    else:
        next_version = 1

    # -------------------------
    # STORAGE
    # -------------------------
    file_path = (
        f"bidder_{bidder_id}/"
        f"{document_type}/"
        f"v{next_version}_{safe_filename}"
    )

    supabase.storage.from_("bid-documents").upload(
        file_path,
        file_bytes,
        {
            "content-type": (
                file.content_type
                or "application/octet-stream"
            ),
            "upsert": "false"
        }
    )

    # -------------------------
    # DATABASE RECORD
    # -------------------------
    document_response = (
        supabase
        .table("documents")
        .insert({
            "bidder_id": bidder_id,
            "document_type": document_type,
            "file_name": safe_filename,
            "file_path": file_path,
            "status": "PROCESSING"
        })
        .execute()
    )

    if not document_response.data:
        raise HTTPException(
            status_code=500,
            detail="Document record could not be created."
        )

    document = document_response.data[0]
    document_id = document["id"]

    # -------------------------
    # BACKGROUND PROCESSING
    # -------------------------
    background_tasks.add_task(
        process_uploaded_document,
        document_id,
        bidder_id,
        document_type,
        file_bytes,
        safe_filename
    )

    # -------------------------
    # RETURN IMMEDIATELY
    # -------------------------
    return {
        "success": True,
        "message": "Document uploaded successfully. Verification started.",
        "document": document,
        "processing": {
            "status": "PROCESSING",
            "document_id": document_id
        }
    } 

# ============================================================
# DOCUMENT PROCESSING STATUS
# ============================================================

@app.get("/documents/{document_id}/status")
def get_document_status(document_id: int):

    try:

        # ----------------------------------------------------
        # 1. Get document
        # ----------------------------------------------------

        document_response = (
            supabase
            .table("documents")
            .select("*")
            .eq("id", document_id)
            .single()
            .execute()
        )

        document = document_response.data

        if not document:
            raise HTTPException(
                status_code=404,
                detail="Document not found."
            )

        # ----------------------------------------------------
        # 2. Get latest verification result
        # ----------------------------------------------------

        result_response = (
            supabase
            .table("verification_results")
            .select("*")
            .eq("document_id", document_id)
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )

        results = result_response.data or []

        # ----------------------------------------------------
        # 3. Verification completed
        # ----------------------------------------------------

        if results:

            latest_result = results[0]

            return {
                "success": True,
                "document_id": document_id,
                "status": "COMPLETED",
                "document": document,
                "verification_result": latest_result
            }

        # ----------------------------------------------------
        # 4. Still processing
        # ----------------------------------------------------

        return {
            "success": True,
            "document_id": document_id,
            "status": "PROCESSING",
            "document": document,
            "verification_result": None
        }

    except HTTPException:
        raise

    except Exception as e:

        print(
            f"[DOC {document_id}] "
            f"Status check error: {str(e)}"
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to check document processing status."
        )
@app.get("/documents/{document_id}/validity")
def get_document_validity(document_id: int):

    response = (
        supabase
        .table("documents")
        .select(
            "id, bidder_id, document_type, version_number, "
            "is_current, valid_from, valid_until, verification_status"
        )
        .eq("id", document_id)
        .single()
        .execute()
    )

    document = response.data

    if not document:
        raise HTTPException(
            status_code=404,
            detail="Document not found."
        )

    validity_status = calculate_document_validity(
        document.get("valid_until")
    )

    return {
        "success": True,
        "document_id": document_id,
        "validity_status": validity_status,
        "valid_from": document.get("valid_from"),
        "valid_until": document.get("valid_until"),
        "days_remaining": (
            (
                date.fromisoformat(str(document["valid_until"])[:10])
                - date.today()
            ).days
            if document.get("valid_until")
            else None
        )
    }
@app.post("/documents/ocr")
def ocr_document(
    file: UploadFile = File(...)
):
    file_bytes = file.file.read()

    text = run_ocr(
        file_bytes,
        file.filename
    )

    fields = extract_gst_fields(text)

    return {
        "success": True,
        "file_name": file.filename,
        "ocr_text": text,
        "extracted_fields": fields
    }

@app.post("/documents/verify-gst")
def verify_gst(
    document_id: int = Form(...),
    file: UploadFile = File(...)
):
    # 1. Get document from Supabase
    document_response = (
        supabase
        .table("documents")
        .select("*")
        .eq("id", document_id)
        .single()
        .execute()
    )

    document = document_response.data

    # 2. Automatically get bidder_id from document
    bidder_id = document["bidder_id"]

    # 3. Get bidder from Supabase
    bidder_response = (
        supabase
        .table("bidders")
        .select("*")
        .eq("id", bidder_id)
        .single()
        .execute()
    )

    bidder = bidder_response.data

    # 4. Read uploaded file
    file_bytes = file.file.read()

    # 5. OCR
    text = run_ocr(
        file_bytes,
        file.filename
    )

    # 6. Extract GST fields
    fields = extract_gst_fields(text)

    # 7. Verify GST
    verification = verify_gst_fields(
        fields,
        bidder
    )

    # 8. Calculate score and risk
    risk_result = calculate_gst_risk(verification)

    # 9. Save verification result
    result = (
        supabase
        .table("verification_results")
        .insert({
            "document_id": document_id,
            "verification_status": verification["status"],
            "issues": ", ".join(verification["issues"]),
            "score": risk_result["score"],
            "risk_level": risk_result["risk_level"],
            "ai_recommendation": risk_result["ai_recommendation"]
        })
        .execute()
    )

    return {
        "success": True,
        "file_name": file.filename,
        "document_id": document_id,
        "bidder_id": bidder_id,
        "extracted_fields": fields,
        "verification": verification,
        "risk_assessment": risk_result,
        "saved_result": result.data
    }

@app.post("/documents/verify-pan")
def verify_pan(
    document_id: int = Form(...),
    file: UploadFile = File(...)
):
    # 1. Get document
    document_response = (
        supabase
        .table("documents")
        .select("*")
        .eq("id", document_id)
        .single()
        .execute()
    )

    document = document_response.data

    # 2. Get bidder automatically
    bidder_id = document["bidder_id"]

    bidder_response = (
        supabase
        .table("bidders")
        .select("*")
        .eq("id", bidder_id)
        .single()
        .execute()
    )

    bidder = bidder_response.data

    # 3. Read file
    file_bytes = file.file.read()

    # 4. OCR
    text = run_ocr(
        file_bytes,
        file.filename
    )

    # 5. Extract PAN fields
    fields = extract_pan_fields(text)

    # 6. Verify PAN
    verification = verify_pan_fields(
        fields,
        bidder
    )

    # 7. Calculate score and risk
    risk_result = calculate_pan_risk(
        verification
    )

    # 8. Save result
    result = (
        supabase
        .table("verification_results")
        .insert({
            "document_id": document_id,
            "verification_status": verification["status"],
            "issues": ", ".join(verification["issues"]),
            "score": risk_result["score"],
            "risk_level": risk_result["risk_level"],
            "ai_recommendation": risk_result["ai_recommendation"]
        })
        .execute()
    )

    # 9. Return result
    return {
        "success": True,
        "file_name": file.filename,
        "document_id": document_id,
        "bidder_id": bidder_id,
        "extracted_fields": fields,
        "verification": verification,
        "risk_assessment": risk_result,
        "saved_result": result.data
    }

@app.post("/documents/verify-udyam")
def verify_udyam(
    document_id: int = Form(...),
    file: UploadFile = File(...)
):
    document_response = (
        supabase
        .table("documents")
        .select("*")
        .eq("id", document_id)
        .single()
        .execute()
    )

    document = document_response.data
    bidder_id = document["bidder_id"]

    bidder_response = (
        supabase
        .table("bidders")
        .select("*")
        .eq("id", bidder_id)
        .single()
        .execute()
    )

    bidder = bidder_response.data

    file_bytes = file.file.read()

    text = run_ocr(
        file_bytes,
        file.filename
    )

    fields = extract_udyam_fields(text)

    verification = verify_udyam_fields(
        fields,
        bidder
    )

    risk_result = calculate_udyam_risk(
        verification
    )

    result = (
        supabase
        .table("verification_results")
        .insert({
            "document_id": document_id,
            "verification_status": verification["status"],
            "issues": ", ".join(verification["issues"]),
            "score": risk_result["score"],
            "risk_level": risk_result["risk_level"],
            "ai_recommendation": risk_result["ai_recommendation"]
        })
        .execute()
    )

    return {
        "success": True,
        "file_name": file.filename,
        "document_id": document_id,
        "bidder_id": bidder_id,
        "extracted_fields": fields,
        "verification": verification,
        "risk_assessment": risk_result,
        "saved_result": result.data
    }

@app.post("/documents/ocr-udyam")
def ocr_udyam_document(
    file: UploadFile = File(...)
):
    file_bytes = file.file.read()

    # Run OCR
    text = run_ocr(
        file_bytes,
        file.filename
    )

    # Extract Udyam fields
    fields = extract_udyam_fields(text)

    return {
        "success": True,
        "file_name": file.filename,
        "ocr_text": text,
        "extracted_fields": fields
    }

@app.post("/documents/ocr-itr")
def ocr_itr_document(
    file: UploadFile = File(...)
):
    file_bytes = file.file.read()

    text = run_ocr(
        file_bytes,
        file.filename
    )

    fields = extract_itr_fields(text)

    return {
        "success": True,
        "file_name": file.filename,
        "ocr_text": text,
        "extracted_fields": fields
    }

@app.post("/documents/verify-itr")
def verify_itr(
    document_id: int = Form(...),
    file: UploadFile = File(...)
):
    # 1. Get document
    document_response = (
        supabase
        .table("documents")
        .select("*")
        .eq("id", document_id)
        .single()
        .execute()
    )

    document = document_response.data
    bidder_id = document["bidder_id"]

    # 2. Get bidder
    bidder_response = (
        supabase
        .table("bidders")
        .select("*")
        .eq("id", bidder_id)
        .single()
        .execute()
    )

    bidder = bidder_response.data

    # 3. Read file
    file_bytes = file.file.read()

    # 4. OCR
    text = run_ocr(
        file_bytes,
        file.filename
    )

    # 5. Extract ITR fields
    fields = extract_itr_fields(text)

    # 6. Verify ITR
    verification = verify_itr_fields(
        fields,
        bidder
    )

    # 7. Calculate risk
    risk_result = calculate_itr_risk(
        verification
    )

    # 8. Save result
    result = (
        supabase
        .table("verification_results")
        .insert({
            "document_id": document_id,
            "verification_status": verification["status"],
            "issues": ", ".join(verification["issues"]),
            "score": risk_result["score"],
            "risk_level": risk_result["risk_level"],
            "ai_recommendation": risk_result["ai_recommendation"]
        })
        .execute()
    )

    # 9. Return result
    return {
        "success": True,
        "file_name": file.filename,
        "document_id": document_id,
        "bidder_id": bidder_id,
        "extracted_fields": fields,
        "verification": verification,
        "risk_assessment": risk_result,
        "saved_result": result.data
    }

@app.get("/compliance/{bidder_id}")
def get_overall_compliance(bidder_id: int):

    # 1. Get all documents uploaded by this bidder
    documents_response = (
        supabase
        .table("documents")
        .select("id")
        .eq("bidder_id", bidder_id)
        .execute()
    )

    documents = documents_response.data or []
    document_ids = [doc["id"] for doc in documents]

    if not document_ids:
        return {
            "success": True,
            "bidder_id": bidder_id,
            "document_ids": [],
            "verification_results": [],
            "overall_compliance": calculate_overall_compliance([])
        }

    # 2. Get all verification results for these documents
    results_response = (
        supabase
        .table("verification_results")
        .select("*")
        .in_("document_id", document_ids)
        .order("created_at", desc=True)
        .execute()
    )

    all_results = results_response.data or []

    # 3. Keep only the latest SCORED result for each document
    latest_results = {}

    for result in all_results:
        document_id = result.get("document_id")
        score = result.get("score")

        # Ignore old verification records without a score
        if score is None:
            continue

        # Because results are ordered newest first,
        # first result for each document is the latest one
        if document_id not in latest_results:
            latest_results[document_id] = result

    results = list(latest_results.values())

    # 4. Calculate overall compliance
    overall = calculate_overall_compliance(results)

    return {
        "success": True,
        "bidder_id": bidder_id,
        "document_ids": document_ids,
        "verification_results": results,
        "overall_compliance": overall
    }

# ============================================================
# BID SUBMISSION
# ============================================================

@app.post("/bid-submissions")
def submit_bid(submission: BidSubmissionCreate):

    try:

        # ----------------------------------------------------
        # Basic validation
        # ----------------------------------------------------

        if not submission.declaration_confirmed:
            raise HTTPException(
                status_code=400,
                detail="Declaration must be confirmed before submitting the bid."
            )

        if not submission.items:
            raise HTTPException(
                status_code=400,
                detail="At least one tender item must be selected."
            )

        # ----------------------------------------------------
        # Check tender
        # ----------------------------------------------------

        tender_response = (
            supabase
            .table("tenders")
            .select("*")
            .eq("id", submission.tender_id)
            .limit(1)
            .execute()
        )

        tenders = tender_response.data or []

        if not tenders:
            raise HTTPException(
                status_code=404,
                detail="Tender not found."
            )

        tender = tenders[0]

        # ----------------------------------------------------
        # Check tender status
        # ----------------------------------------------------

        tender_status = str(
            tender.get("status") or ""
        ).upper()

        if tender_status != "OPEN":
            raise HTTPException(
                status_code=400,
                detail="This tender is not open for bid submission."
            )

        # ----------------------------------------------------
        # Get tender items
        # ----------------------------------------------------

        tender_items_response = (
            supabase
            .table("tender_items")
            .select("id, quantity")
            .eq("tender_id", submission.tender_id)
            .execute()
        )

        tender_items = (
            tender_items_response.data or []
        )

        valid_item_ids = {
            int(item["id"])
            for item in tender_items
        }

        # ----------------------------------------------------
        # Validate selected items
        # ----------------------------------------------------

        selected_item_ids = set()

        for item in submission.items:

            if item.item_id in selected_item_ids:
                raise HTTPException(
                    status_code=400,
                    detail=f"Duplicate item selected: {item.item_id}"
                )

            selected_item_ids.add(
                item.item_id
            )

            if item.item_id not in valid_item_ids:
                raise HTTPException(
                    status_code=400,
                    detail=(
                        f"Item {item.item_id} does not belong "
                        f"to this tender."
                    )
                )

            if item.quoted_price <= 0:
                raise HTTPException(
                    status_code=400,
                    detail=(
                        f"Quoted price must be greater than "
                        f"zero for item {item.item_id}."
                    )
                )

            if not item.specifications.strip():
                raise HTTPException(
                    status_code=400,
                    detail=(
                        f"Specifications are required "
                        f"for item {item.item_id}."
                    )
                )

            if not item.delivery_time.strip():
                raise HTTPException(
                    status_code=400,
                    detail=(
                        f"Delivery time is required "
                        f"for item {item.item_id}."
                    )
                )

        # ----------------------------------------------------
        # Calculate total quotation
        # ----------------------------------------------------

        total_amount = sum(
            float(item.quoted_price)
            for item in submission.items
        )

        # ----------------------------------------------------
        # Check duplicate submission
        # ----------------------------------------------------

        existing_response = (
            supabase
            .table("bid_submissions")
            .select("id, status")
            .eq(
                "bidder_id",
                submission.bidder_id
            )
            .eq(
                "tender_id",
                submission.tender_id
            )
            .limit(1)
            .execute()
        )

        existing = (
            existing_response.data or []
        )

        if existing:
            raise HTTPException(
                status_code=409,
                detail=(
                    "You have already submitted a bid "
                    "for this tender."
                )
            )

        # ----------------------------------------------------
        # Create submission
        # ----------------------------------------------------

        submission_response = (
            supabase
            .table("bid_submissions")
            .insert({
                "bidder_id": submission.bidder_id,
                "tender_id": submission.tender_id,
                "status": "SUBMITTED",
                "declaration_confirmed": True,
                "total_amount": total_amount
            })
            .execute()
        )

        created_submission = (
            submission_response.data or []
        )

        if not created_submission:
            raise HTTPException(
                status_code=500,
                detail="Unable to create bid submission."
            )

        submission_id = created_submission[0]["id"]

        # ----------------------------------------------------
        # Create submission items
        # ----------------------------------------------------

        submission_items = [
            {
                "submission_id": submission_id,
                "item_id": item.item_id,
                "quoted_price": item.quoted_price,
                "specifications": item.specifications.strip(),
                "delivery_time": item.delivery_time.strip()
            }
            for item in submission.items
        ]

        try:

            items_response = (
                supabase
                .table("bid_submission_items")
                .insert(submission_items)
                .execute()
            )

        except Exception as item_error:

            # Cleanup parent submission
            try:
                (
                    supabase
                    .table("bid_submissions")
                    .delete()
                    .eq(
                        "id",
                        submission_id
                    )
                    .execute()
                )
            except Exception:
                pass

            raise item_error

        # ----------------------------------------------------
        # Final response
        # ----------------------------------------------------

        return {
            "success": True,
            "message": "Bid submitted successfully.",
            "submission": created_submission[0],
            "items": (
                items_response.data or []
            )
        }

    except HTTPException:
        raise

    except Exception as e:

        print(
            f"Bid submission error: {e}"
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to submit bid."
        )

# ============================================================
# GET ALL BID SUBMISSIONS FOR OFFICER REVIEW
# ============================================================

@app.get("/bid-submissions/all")
def get_all_bid_submissions():

    try:
        submissions_response = (
            supabase
            .table("bid_submissions")
            .select("*")
            .order("submitted_at", desc=True)
            .execute()
        )

        submissions = submissions_response.data or []

        if not submissions:
            return {"success": True, "submissions": []}

        bidder_ids = list({
            int(submission["bidder_id"])
            for submission in submissions
            if submission.get("bidder_id") is not None
        })

        bidders_response = (
            supabase
            .table("bidders")
            .select("id, bidder_code, company_name, email, phone")
            .in_("id", bidder_ids)
            .execute()
        )

        bidder_map = {
            int(bidder["id"]): bidder
            for bidder in (bidders_response.data or [])
        }

        tender_ids = list({
            int(submission["tender_id"])
            for submission in submissions
            if submission.get("tender_id") is not None
        })

        tenders_response = (
            supabase
            .table("tenders")
            .select(
                "id, tender_number, title, description, department, "
                "procurement_category, submission_deadline, status"
            )
            .in_("id", tender_ids)
            .execute()
        )

        tender_map = {
            int(tender["id"]): tender
            for tender in (tenders_response.data or [])
        }

        submission_ids = list({
            int(submission["id"])
            for submission in submissions
            if submission.get("id") is not None
        })

        items_response = (
            supabase
            .table("bid_submission_items")
            .select(
                "id, submission_id, item_id, quoted_price, "
                "specifications, delivery_time"
            )
            .in_("submission_id", submission_ids)
            .execute()
        )

        submission_items = items_response.data or []

        item_ids = list({
            int(item["item_id"])
            for item in submission_items
            if item.get("item_id") is not None
        })

        item_map = {}

        if item_ids:
            tender_items_response = (
                supabase
                .table("tender_items")
                .select("id, item_name, quantity, unit")
                .in_("id", item_ids)
                .execute()
            )

            item_map = {
                int(item["id"]): item
                for item in (tender_items_response.data or [])
            }

        items_by_submission = {}

        for item in submission_items:
            submission_id = int(item["submission_id"])

            enriched_item = {
                **item,
                "tender_item": item_map.get(int(item["item_id"]))
            }

            items_by_submission.setdefault(
                submission_id, []
            ).append(enriched_item)

        result = []

        for submission in submissions:
            submission_id = int(submission["id"])
            bidder_id = int(submission["bidder_id"])
            tender_id = int(submission["tender_id"])

            result.append({
                **submission,
                "bidder": bidder_map.get(bidder_id),
                "tender": tender_map.get(tender_id),
                "items": items_by_submission.get(
                    submission_id, []
                )
            })

        return {
            "success": True,
            "submissions": result
        }

    except Exception as e:
        print(f"Get all bid submissions error: {e}")

        raise HTTPException(
            status_code=500,
            detail="Unable to load submitted bids."
        )

# ============================================================
# GET BIDDER SUBMISSIONS
# ============================================================

@app.get("/bid-submissions/{bidder_id}")
def get_bidder_submissions(bidder_id: int):

    try:

        # ----------------------------------------------------
        # Get all submissions of bidder
        # ----------------------------------------------------

        submissions_response = (
            supabase
            .table("bid_submissions")
            .select("*")
            .eq("bidder_id", bidder_id)
            .order("submitted_at", desc=True)
            .execute()
        )

        submissions = (
            submissions_response.data or []
        )

        if not submissions:
            return {
                "success": True,
                "submissions": []
            }

        # ----------------------------------------------------
        # Get tender information
        # ----------------------------------------------------

        tender_ids = list({
            int(submission["tender_id"])
            for submission in submissions
        })

        tenders_response = (
            supabase
            .table("tenders")
            .select(
                "id, tender_number, title, description, "
                "department, procurement_category, "
                "submission_deadline, status"
            )
            .in_("id", tender_ids)
            .execute()
        )

        tenders = (
            tenders_response.data or []
        )

        tender_map = {
            int(tender["id"]): tender
            for tender in tenders
        }

        # ----------------------------------------------------
        # Get submission items
        # ----------------------------------------------------

        submission_ids = [
            int(submission["id"])
            for submission in submissions
        ]

        items_response = (
            supabase
            .table("bid_submission_items")
            .select(
                "id, submission_id, item_id, "
                "quoted_price, specifications, delivery_time"
            )
            .in_(
                "submission_id",
                submission_ids
            )
            .execute()
        )

        submission_items = (
            items_response.data or []
        )

        # ----------------------------------------------------
        # Get tender item names
        # ----------------------------------------------------

        item_ids = list({
            int(item["item_id"])
            for item in submission_items
        })

        item_map = {}

        if item_ids:

            tender_items_response = (
                supabase
                .table("tender_items")
                .select(
                    "id, item_name, quantity, unit"
                )
                .in_("id", item_ids)
                .execute()
            )

            tender_items = (
                tender_items_response.data or []
            )

            item_map = {
                int(item["id"]): item
                for item in tender_items
            }

        # ----------------------------------------------------
        # Group items by submission
        # ----------------------------------------------------

        items_by_submission = {}

        for item in submission_items:

            submission_id = int(
                item["submission_id"]
            )

            enriched_item = {
                **item,
                "tender_item":
                    item_map.get(
                        int(item["item_id"])
                    )
            }

            items_by_submission.setdefault(
                submission_id,
                []
            ).append(
                enriched_item
            )

        # ----------------------------------------------------
        # Build final response
        # ----------------------------------------------------

        result = []

        for submission in submissions:

            submission_id = int(
                submission["id"]
            )

            tender_id = int(
                submission["tender_id"]
            )

            result.append({
                **submission,

                "tender":
                    tender_map.get(
                        tender_id
                    ),

                "items":
                    items_by_submission.get(
                        submission_id,
                        []
                    )
            })

        return {
            "success": True,
            "submissions": result
        }

    except Exception as e:

        print(
            f"Get bidder submissions error: {e}"
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to load submitted bids."
        )

# ============================================================
# OFFICER: ALL SUBMITTED BIDS
# ============================================================

@app.get("/officer/bid-submissions")
def get_all_bid_submissions_for_officer():
    """Return every submitted bid with bidder, tender and item-wise commercial details."""
    try:
        submissions_response = (
            supabase.table("bid_submissions")
            .select("*")
            .order("submitted_at", desc=True)
            .execute()
        )
        submissions = submissions_response.data or []

        if not submissions:
            return {"success": True, "submissions": []}

        bidder_ids = list({int(row["bidder_id"]) for row in submissions})
        tender_ids = list({int(row["tender_id"]) for row in submissions})
        submission_ids = [int(row["id"]) for row in submissions]

        bidders_response = (
            supabase.table("bidders")
            .select("*")
            .in_("id", bidder_ids)
            .execute()
        )
        bidders = {int(row["id"]): row for row in (bidders_response.data or [])}

        tenders_response = (
            supabase.table("tenders")
            .select("*")
            .in_("id", tender_ids)
            .execute()
        )
        tenders = {int(row["id"]): row for row in (tenders_response.data or [])}

        items_response = (
            supabase.table("bid_submission_items")
            .select("*")
            .in_("submission_id", submission_ids)
            .execute()
        )
        raw_items = items_response.data or []

        item_ids = list({int(row["item_id"]) for row in raw_items})
        item_map = {}
        if item_ids:
            tender_items_response = (
                supabase.table("tender_items")
                .select("id, item_name, quantity, unit, specifications, mandatory_requirements")
                .in_("id", item_ids)
                .execute()
            )
            item_map = {int(row["id"]): row for row in (tender_items_response.data or [])}

        items_by_submission = {}
        for row in raw_items:
            sid = int(row["submission_id"])
            items_by_submission.setdefault(sid, []).append({
                **row,
                "tender_item": item_map.get(int(row["item_id"]))
            })

        result = []
        for submission in submissions:
            sid = int(submission["id"])
            bidder = bidders.get(int(submission["bidder_id"]), {})
            tender = tenders.get(int(submission["tender_id"]), {})
            established_year = bidder.get("established_year")
            experience_years = None
            if established_year:
                experience_years = max(0, date.today().year - int(established_year))

            result.append({
                **submission,
                "bidder": {
                    "id": bidder.get("id"),
                    "bidder_code": bidder.get("bidder_code"),
                    "company_name": bidder.get("company_name"),
                    "gstin": bidder.get("gstin"),
                    "pan": bidder.get("pan"),
                    "udyam_number": bidder.get("udyam_number"),
                    "established_year": established_year,
                    "experience_years": experience_years,
                    "annual_turnover": bidder.get("annual_turnover"),
                    "business_type": bidder.get("business_type"),
                    "primary_trade": bidder.get("primary_trade"),
                },
                "tender": tender,
                "items": items_by_submission.get(sid, [])
            })

        return {"success": True, "submissions": result}
    except Exception as e:
        print(f"Officer bid submissions error: {e}")
        raise HTTPException(
            status_code=500,
            detail="Unable to load submitted bids for officer."
        )

# ============================================================
# GET ALL BID SUBMISSIONS - OFFICER REVIEW
# ============================================================

@app.get("/bid-submissions")
def get_all_bid_submissions():

    try:

        # ----------------------------------------------------
        # Get all submitted bids
        # ----------------------------------------------------

        submissions_response = (
            supabase
            .table("bid_submissions")
            .select("*")
            .order("submitted_at", desc=True)
            .execute()
        )

        submissions = (
            submissions_response.data or []
        )

        if not submissions:
            return {
                "success": True,
                "submissions": []
            }

        # ----------------------------------------------------
        # Get bidder information
        # ----------------------------------------------------

        bidder_ids = list({
            int(submission["bidder_id"])
            for submission in submissions
            if submission.get("bidder_id") is not None
        })

        bidder_map = {}

        if bidder_ids:

            bidders_response = (
                supabase
                .table("bidders")
                .select(
                    "id, bidder_code, company_name"
                )
                .in_("id", bidder_ids)
                .execute()
            )

            bidders = (
                bidders_response.data or []
            )

            bidder_map = {
                int(bidder["id"]): bidder
                for bidder in bidders
            }

        # ----------------------------------------------------
        # Get tender information
        # ----------------------------------------------------

        tender_ids = list({
            int(submission["tender_id"])
            for submission in submissions
            if submission.get("tender_id") is not None
        })

        tender_map = {}

        if tender_ids:

            tenders_response = (
                supabase
                .table("tenders")
                .select(
                    "id, tender_number, title, "
                    "description, department, "
                    "procurement_category, "
                    "submission_deadline, status"
                )
                .in_("id", tender_ids)
                .execute()
            )

            tenders = (
                tenders_response.data or []
            )

            tender_map = {
                int(tender["id"]): tender
                for tender in tenders
            }

        # ----------------------------------------------------
        # Get submission items
        # ----------------------------------------------------

        submission_ids = [
            int(submission["id"])
            for submission in submissions
            if submission.get("id") is not None
        ]

        items_by_submission = {}

        if submission_ids:

            items_response = (
                supabase
                .table("bid_submission_items")
                .select(
                    "id, submission_id, item_id, "
                    "quoted_price, specifications, "
                    "delivery_time"
                )
                .in_(
                    "submission_id",
                    submission_ids
                )
                .execute()
            )

            submission_items = (
                items_response.data or []
            )

            # ------------------------------------------------
            # Get tender item names
            # ------------------------------------------------

            item_ids = list({
                int(item["item_id"])
                for item in submission_items
                if item.get("item_id") is not None
            })

            item_map = {}

            if item_ids:

                tender_items_response = (
                    supabase
                    .table("tender_items")
                    .select(
                        "id, item_name, quantity, unit"
                    )
                    .in_(
                        "id",
                        item_ids
                    )
                    .execute()
                )

                tender_items = (
                    tender_items_response.data or []
                )

                item_map = {
                    int(item["id"]): item
                    for item in tender_items
                }

            # ------------------------------------------------
            # Group items by submission
            # ------------------------------------------------

            for item in submission_items:

                submission_id = int(
                    item["submission_id"]
                )

                enriched_item = {
                    **item,
                    "tender_item":
                        item_map.get(
                            int(item["item_id"])
                        )
                }

                items_by_submission.setdefault(
                    submission_id,
                    []
                ).append(
                    enriched_item
                )

        # ----------------------------------------------------
        # Build final officer response
        # ----------------------------------------------------

        result = []

        for submission in submissions:

            submission_id = int(
                submission["id"]
            )

            bidder_id = int(
                submission["bidder_id"]
            )

            tender_id = int(
                submission["tender_id"]
            )

            result.append({

                **submission,

                "bidder":
                    bidder_map.get(
                        bidder_id
                    ),

                "tender":
                    tender_map.get(
                        tender_id
                    ),

                "items":
                    items_by_submission.get(
                        submission_id,
                        []
                    )

            })

        return {
            "success": True,
            "submissions": result
        }

    except Exception as e:

        print(
            f"Get all bid submissions error: {e}"
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to load submitted bids."
        )
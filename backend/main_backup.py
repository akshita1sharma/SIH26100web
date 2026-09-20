import os

from fastapi import FastAPI
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
    allow_origins=["http://localhost:5173"],
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

    return {
        "success": True,
        "tender_id": tender_id,
        "items": response.data
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

from fastapi import UploadFile, File, Form, HTTPException, BackgroundTasks

@app.get("/documents")
def get_documents():
    response = (
        supabase
        .table("documents")
        .select("*")
        .order("created_at", desc=True)
        .execute()
    )

    return {
        "success": True,
        "documents": response.data
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
    # STORAGE
    # -------------------------
    file_path = f"bidder_{bidder_id}/{file.filename}"

    supabase.storage.from_("bid-documents").upload(
        file_path,
        file_bytes,
        {
            "content-type": (
                file.content_type
                or "application/octet-stream"
            ),
            "upsert": "true"
        }
    )

    # -------------------------
    # DATABASE RECORD
    # -------------------------
    document_response = (
        supabase.table("documents")
        .insert({
            "bidder_id": bidder_id,
            "document_type": document_type,
            "file_name": file.filename,
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
        file.filename
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
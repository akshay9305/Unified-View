from fastapi import Request, HTTPException,Form, status, APIRouter,Query
from autogen import AssistantAgent, UserProxyAgent, GroupChat, GroupChatManager
from fastapi.responses import JSONResponse
from azure.cosmos import exceptions
from typing import Optional
from pydantic import BaseModel
from azure.cosmos import CosmosClient
from azure.cosmos import CosmosClient
from typing import List, Union, Dict, Any
from fastapi.responses import JSONResponse
from starlette.requests import Request
from datetime import datetime
import os
import uuid
from utility.creditServiceHelper import *
from utility.helper import get_active_categories
import bcrypt
from jose import jwt
from datetime import datetime, timezone, timedelta
from utility.inference import *


from dotenv import load_dotenv
load_dotenv("unified.env")
# --------------------------------------------------
# MINIMAL LOCAL TEST FUNCTION
# --------------------------------------------------
def run_local_test(question: str, email: str):
    if not question or not question.strip():
        raise ValueError("Question cannot be empty")

    print("\n==============================")
    print("QUESTION:", question)
    print("==============================\n")

    start_time = time.time()

    try:
        asyncio.run(
            start_agenting_process(
                query=question,
                index_type="hybrid",   # default
                filter=None,
                explain_code=False,
                category=None,
                email=email  # pass email here
            )
        )
    except RuntimeError:
        # Handles existing event loop (Jupyter / Streamlit)
        loop = asyncio.get_event_loop()
        loop.run_until_complete(
            start_agenting_process(
                query=question,
                index_type="hybrid",
                filter=None,
                explain_code=False,
                category=None,
                email=email
            )
        )

    end_time = time.time()

    print("\n==============================")
    print("DONE")
    print("Time Taken (sec):", round(end_time - start_time, 2))
    print("==============================\n")


# --------------------------------------------------
# RUN DIRECTLY
# --------------------------------------------------
if __name__ == "__main__":
    try:
        HARDCODED_QUESTION = "Which products are exclusively supplied by certain distributors?"
        TEST_EMAIL = "test@afiine.ai"  # <- correct way

        run_local_test(HARDCODED_QUESTION, TEST_EMAIL)

    except Exception:
        print("\n❌ ERROR OCCURRED")
        import traceback
        traceback.print_exc()

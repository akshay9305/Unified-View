# 📋 UnifiedView Project Cheat Sheet

---

## **PROJECT OVERVIEW**

| Property | Details |
|----------|---------|
| **Project Name** | UnifiedView - ERYL-QUIN (Multi-Agent AI Q&A System) |
| **Purpose** | Enterprise-grade conversational AI platform for business intelligence that understands databases and documents, answers complex questions using SQL + LLM agents |
| **Version** | Dev-QA Environment |
| **Team** | Affine Company |

---

## **TECH STACK**

### **Backend**
- **Framework**: FastAPI (Python async)
- **AI/Agents**: AutoGen (Microsoft multi-agent orchestration)
- **LLM**: Azure OpenAI (gpt-4o / gpt-5.2)
- **Search**: Azure Cognitive Search (vector embeddings)
- **Database**: Azure SQL Server (user data) + Azure Cosmos DB (metadata, QA history)
- **Storage**: Azure Blob Storage (documents)
- **Queue**: Azure Queue Storage (background jobs)
- **Vector DB**: LanceDB (for GraphRAG)

### **Frontend**
- **Framework**: React + TypeScript
- **Build**: Vite
- **UI**: React Bootstrap
- **HTTP Client**: Axios
- **Styling**: SCSS

### **Cloud Services**
- Azure OpenAI API
- Azure Cognitive Search
- Azure Cosmos DB
- Azure Blob Storage
- Azure Queue Storage
- Azure SQL Database

---

## **ARCHITECTURE**

### **Main Entry File**
```
Backend/main.py
└─ FastAPI application
   ├─ Handles POST /generate_response endpoint
   ├─ Credit balance validation
   ├─ Routes to AI or database mode
   └─ Manages response orchestration
```

### **Key Routers** (API Entry Points)
| Router | Endpoint | Purpose |
|--------|----------|---------|
| **userManagementRouter.py** | `/userManagement/` | Login, register, JWT auth |
| **userCreditService.py** | `/userCreditService/` | Check balance, deduct credits |
| **documentService.py** | `/documentService/` | Upload, manage documents |
| **dbConnectionRouter.py** | `/dbConnectionRouter/` | Get database tables & schema |
| **uploadManagementRouter.py** | `/uploadManagementRouter/` | Handle file uploads |
| **categoryManagementRouter.py** | `/categoryManagement/` | Create & assign categories |
| **configManagementRouter.py** | `/configManagement/` | System configuration |

### **Key Services** (Business Logic)
| Service | Responsibility |
|---------|-----------------|
| **userCreditService.py** | Credit balance checking, deduction, transaction tracking |
| **documentService.py** | Document upload, storage, categorization, retrieval |
| **setupService.py** | Initial system setup (Cosmos containers, indexes) |
| **unifiedService.py** | Unified business logic coordination |
| **userCreditService.py** | User credit management |
| **embedService.py** | Document embedding & vectorization |

### **Utility/Helper Files** (Core Logic)
| File | Purpose |
|------|---------|
| **inference.py** | Multi-agent orchestration (AutoGen agents) |
| **acsServiceHelper.py** | Azure Cognitive Search integration, similarity search |
| **helper.py** | Utility functions (formatting, schema retrieval, error handling) |
| **langchainadapters.py** | LangChain integration |
| **lookuptool.py** | Lookup and reference tools |
| **unifiedServiceHelper.py** | Service helper functions |

---

## **DATABASE ARCHITECTURE**

### **Azure SQL Server** (User Data)
```
Tables: Inventory, Invoice_2, Order, shipping
├─ Stores business data
└─ User-specific databases per organization
```

### **Azure Cosmos DB** (NoSQL Metadata)
| Container | Purpose |
|-----------|---------|
| **gi_users** | User account information |
| **gi_category** | Document categories (FMCG, Procurement) |
| **gi_qa** | Q&A history with feedback |
| **gi_uploads** | Document metadata |
| **transactions** | Credit transaction logs |
| **config** | System configuration |

### **Azure Blob Storage**
```
Container: unifiedview
└─ Stores uploaded documents (PDFs, CSVs, etc.)
```

### **Azure Search Indexes**
| Index | Purpose |
|-------|---------|
| **unifiedview-dev** | Document vector search |
| **unified_dev_qna_index** | Q&A similarity search |

---

## **AUTHENTICATION FLOW**

```
1. USER ENTERS CREDENTIALS
   ↓
2. API → userManagementRouter.login()
   ├─ Retrieve user from gi_users (Cosmos)
   ├─ Hash & validate password
   └─ Check if user exists & active
   ↓
3. GENERATE JWT TOKEN
   ├─ Secret Key: Y7h#2Dp&6kJ9d!M3fR@tP1gW*5zQ8cT
   ├─ Algorithm: HS256
   ├─ Expiry: 60 minutes
   └─ Payload: email, role, user_id
   ↓
4. RETURN TOKEN TO FRONTEND
   ↓
5. FRONTEND STORES TOKEN
   └─ Uses for all future API requests (Authorization header)
   ↓
6. BACKEND VALIDATES TOKEN
   └─ Verifies JWT before processing any request
```

### **User Roles**
- **superAdmin**: Full system access
- **admin**: Category & document management
- **user**: Basic Q&A access

---

## **REQUEST FLOW** (How Questions Are Processed)

```
1. FRONTEND SENDS QUESTION
   POST /generate_response
   {
     email: "user@affine.ai",
     question: "How do sales vary by region?",
     useai: 0,  // 0=database only, 1=AI enhanced
     overrides: { include_category: [...] }
   }
   ↓
2. BACKEND VALIDATION
   ├─ Check JWT token validity
   ├─ Get user email from token
   ├─ Verify user exists & is active
   └─ Check user's database connection
   ↓
3. CREDIT CHECK
   ├─ Query gi_users.credits
   ├─ Calculate remaining balance
   └─ If insufficient → Return error (403)
   ↓
4. ROUTE QUESTION
   ├─ IF useai=0: Search database + past Q&A
   │  ├─ Query Cosmos gi_qa for similar questions
   │  ├─ If found → Return cached answer
   │  └─ If not → Call AI agenting
   │
   └─ IF useai=1: Direct AI processing
      ├─ Skip database search
      └─ Call AI agenting directly
   ↓
5. AI AGENTING PROCESS (inference.py)
   ├─ Routing Agent: Understands question intent
   ├─ SQL Agent: Generates SQL query
   ├─ SQL Executor: Runs query on database
   ├─ Retriever Agent: Fetches relevant documents
   ├─ LLM Agent: Generates natural language answer
   └─ Critic Agent: Reviews & validates response
   ↓
6. FORMAT & RETURN
   ├─ Structure response JSON
   ├─ Include SQL query, thoughts, data points
   ├─ Deduct credits from user
   └─ Return to frontend
   ↓
7. FRONTEND DISPLAYS
   ├─ Show AI-generated insights
   ├─ Display data visualizations
   └─ Show query executed
```

---

## **CONFIGURATION** (unified.env)

```env
# Azure OpenAI
OPENAI_API_TYPE=azure
AZURE_OPENAI_API_BASE=https://mini-models.openai.azure.com/
AZURE_OPENAI_API_KEY=3G19Yd5Q5A2iD19O4FX72R1TvU1UYdfGggXD3Mfs0p1gjk9Wxjr9JQQJ99BEACfhMk5XJ3w3AAABACOGuy3O
AZURE_OPENAI_API_VERSION=2024-12-01-preview
GPT3_LLM_MODEL_DEPLOYMENT_NAME=GPT-4o-Intern

# Azure Search
AZURE_SEARCH_SERVICE_ENDPOINT=https://unifiedview-dev.search.windows.net
AZURE_SEARCH_ADMIN_KEY=TwdSWcVUyWUYWKwD6ZBKF5FpMVbsWMcc4bt2aXQOtIAzSeBum0hQ

# Cosmos DB
COSMOS_ENDPOINT=https://uniview-dev.documents.azure.com:443/
COSMOS_KEY=pV9ERwWt5pu67lKPEdBWzAPdMjaQq7xoLUiEqVNLWTtY0WcDTsHcjf3DAxlAOgaWjeWdMN3nIOdmACDbMYupng==
COSMOS_DATABASE_NAME=unified_dev_db

# JWT
JWT_SECRET_KEY=Y7h#2Dp&6kJ9d!M3fR@tP1gW*5zQ8cT
JWT_TOKEN_EXPIRE_MINUTES=60
JWT_TOKEN_ALGORITHM=HS256

# Credits
TOKEN_PER_CREDIT=1000
```

---

## **KEY ENDPOINTS**

### **Authentication**
```
POST /userManagement/login
  → Authenticates user, returns JWT token

POST /userManagement/register
  → Creates new user account
```

### **Questions & Insights**
```
POST /generate_response
  → Main endpoint for asking questions
  → Input: email, question, useai flag, categories
  → Output: answer, SQL query, data points, thoughts

POST /userCreditService/user/questions
  → Tracks question history
```

### **Documents**
```
POST /uploadManagement/upload
  → Upload document to system

GET /documentService/getCategories
  → Get user's categories

GET /dbConnectionRouter/get_user_tables
  → Get available tables in user's database
```

### **System**
```
GET /userCreditService/get_user_balance
  → Check user's credit balance

GET /configManagement/get_config
  → Get system configuration
```

---

## **STARTUP COMMANDS**

### **Backend**
```bash
cd Backend
source unifiedview-env/Scripts/activate  # Activate venv
uvicorn main:app --port 8000 --reload    # Start FastAPI
```

### **Frontend**
```bash
cd Frontend
npm install
npm run dev  # Start Vite dev server
```

---

## **QUICK DEBUG CHECKLIST**

- [ ] Is Azure OpenAI deployment name correct? (Check Azure Portal)
- [ ] Is user in Cosmos DB gi_users container?
- [ ] Does user have credits available?
- [ ] Is user assigned to categories?
- [ ] Can backend connect to SQL database?
- [ ] Are Azure Search indexes created?
- [ ] Is JWT token valid and not expired?
- [ ] Check backend logs: `time_taken_check_balance_query`

---

## **SUPER ADMIN LOGIN**

```
Email: super_admin@affine.ai
Password: Affine@2025
Credits: 89 (initially)
Role: superAdmin
```

---

**Last Updated**: December 31, 2025 | **Environment**: Dev-QA | **Status**: Active Development

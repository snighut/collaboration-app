┌─────────────────────────────────────────────────────────────────┐
│                     User Flow                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Frontend (collaboration-app/design page)                        │
│    ↓ 1. User clicks "Ingest System Design PDF" button                         │
│    ↓ 2. Select PDF file                                         │
│    ↓ 3. Calculate SHA256 hash                                   │
│    ↓ 4. POST /ingestion/upload-url {fileName, fileHash}         │
│    ↓                                                             │
│  API Pod (llm-service)                                           │
│    ↓ 5. Check Postgres DB (duplicate?)                          │
│    ↓ 6. Generate pre-signed R2 URL                              │
│    ↓ 7. Return uploadUrl + objectKey                            │
│    ↓                                                             │
│  Frontend                                                         │
│    ↓ 8. PUT to R2 (direct upload, bypasses API)                 │
│    ↓ 9. POST /ingestion/process {objectKey, fileHash}           │
│    ↓                                                             │
│  API Pod                                                          │
│    ↓ 10. Save metadata to Postgres (status: processing)         │
│    ↓ 11. Enqueue job in Redis (BullMQ)                          │
│    ↓ 12. Return jobId                                           │
│    ↓                                                             │
│  Worker Pod                                                       │
│    ↓ 13. Dequeue job from Redis                                 │
│    ↓ 14. Download PDF from R2                                   │
│    ↓ 15. Chunk PDF (RecursiveCharacterTextSplitter)             │
│    ↓ 16. Batch embed chunks (Strategy 3: batch → fallback)      │
│    ↓ 17. Store vectors + text in Qdrant                         │
│    ↓ 18. Update Postgres (status: completed, chunk_count)       │
│    ↓ 19. Delete PDF from R2 (cleanup)                           │
│    ↓                                                             │
│  Frontend                                                         │
│    ↓ 20. Poll GET /ingestion/status/:jobId                      │
│    ↓ 21. Show progress bar (0% → 100%)                          │
│    ✓ 22. Show success message                                   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
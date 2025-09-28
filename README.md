# Water Quality Monitoring Application

A SvelteKit application for processing water quality data from CSV files, specifically calculating average water temperature values by monitoring location.

## **Project Overview**

**Aim**: Process water quality CSV files and calculate average water temperature by monitoring location.

**Requirements**:
- Upload CSV files
- Filter for "CharacteristicName" === "Temperature, water"  
- Calculate average "ResultValue" for each "MonitoringLocationID"
- Display results in a user-friendly interface

### **Architecture Strategy**

### **Local Prototype (Current)**
```
User Uploads CSV → SvelteKit API Route → CSV Processing →  Display Result
```
**Scalability Limitations:**
- Single server bottleneck - all processing on one instance
- Memory constraints - large files could crash the server
- No horizontal scaling - can't handle multiple concurrent users
- Blocking operations - processing blocks other requests


### **How we can enhance it to make the application scalable**
```
User Uploads CSV → S3 → SQS → Lambda → Results Storage → Frontend Polling
```
- **File Upload**: Direct to S3 with presigned URLs
- **Event-Driven Processing**: S3 triggers Lambda via SQS for background processing
- **Results Storage**: Store processed results back to S3
- **Frontend Updates**: Poll for results or use WebSocket for real-time updates
- **Progress Tracking**: Show processing status for large files

## **Technology Stack**

### **Frontend**
- **SvelteKit**: Modern full-stack framework
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first styling for rapid UI development
- **Vite**: Fast build tool and development server

### **Backend**
- **Node.js 22**: Latest LTS with modern features


### **Data Processing**
- **neat-csv**: npm package for fast and robust parsing for quoted fields and edge cases
- **Error Handling**: Graceful failure and user feedback

### **Local Development**
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## **Next Steps**

**Phase 1 (Current)**:
1. Completed SvelteKit file upload UI
2. Implemented CSV processing API route
3. Built results display component
4. Add comprehensive error handling


**Phase 2 (Enhancement)**:
1. Add asynchronous processing via AWS S3, SQS and Lambda
2. Implement real-time status updates
3. Scale for production workloads

---

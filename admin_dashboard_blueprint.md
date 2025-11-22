# 🧠 SafeChat.AI — Admin Dashboard Final Blueprint

---

## ⚙️ 1. System Architecture Overview

**Admin Dashboard** is the top-level management portal of SafeChat.AI.  
It provides real-time visibility and control over:
- Users & Moderators
- Chats
- AI Models & Logs
- System Performance
- Reports & Analytics

---

## 🧬 2. Data Models (Prisma + FastAPI Integration)

### 🧟 User
```prisma
model User {
  id          Int      @id @default(autoincrement())
  fullName    String
  username    String   @unique
  email       String   @unique
  role        Role     @default(USER)
  status      UserStatus @default(ACTIVE)
  createdAt   DateTime @default(now())
  messages    Message[]
}

enum Role {
  USER
  MODERATOR
  ADMIN
}

enum UserStatus {
  ACTIVE
  SUSPENDED
  BANNED
}
```

### 💬 Chat
```prisma
model Chat {
  id          Int       @id @default(autoincrement())
  name        String?
  createdAt   DateTime  @default(now())
  messages    Message[]
}
```

### 🧠 AIModel
```prisma
model AIModel {
  id          Int      @id @default(autoincrement())
  name        String
  endpoint    String
  status      ModelStatus @default(ACTIVE)
  threshold   Float     @default(0.85)
  lastUpdated DateTime  @default(now())
}

enum ModelStatus {
  ACTIVE
  DISABLED
}
```

### 🚨 ModerationLog
```prisma
model ModerationLog {
  id           Int      @id @default(autoincrement())
  moderatorId  Int
  messageId    Int
  category     String
  decision     String   // approved, removed, warned
  confidence   Float
  createdAt    DateTime @default(now())
  moderator    User     @relation(fields: [moderatorId], references: [id])
}
```

### 🦾 Report
```prisma
model Report {
  id          Int      @id @default(autoincrement())
  reporterId  Int
  chatId      Int
  message     String
  status      ReportStatus @default(PENDING)
  createdAt   DateTime @default(now())
}

enum ReportStatus {
  PENDING
  REVIEWED
  CLOSED
}
```

---

## 🧽 3. API Data Flow Overview

| Resource | Route | Method | Description |
|-----------|--------|--------|--------------|
| Users | `/api/admin/users` | GET / PUT / DELETE | Fetch, update, or remove users |
| Moderators | `/api/admin/moderators` | GET / POST / DELETE | Manage moderator accounts |
| Chats | `/api/admin/chats` | GET | Fetch active or flagged chats |
| Models | `/api/admin/models` | GET / PUT / POST | Manage AI model configurations |
| Reports | `/api/admin/reports` | GET / PUT | View moderation reports |
| Stats | `/api/admin/stats` | GET | Dashboard metrics for charts |

---

## 💃️ 4. Zustand Stores

### 🧟 useUserStore
```ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: number;
  fullName: string;
  email: string;
  role: "USER" | "MODERATOR" | "ADMIN";
  status: "ACTIVE" | "SUSPENDED" | "BANNED";
}

interface UserStore {
  users: User[];
  selectedUser: User | null;
  fetchUsers: () => Promise<void>;
  updateUser: (id: number, updates: Partial<User>) => Promise<void>;
  deleteUser: (id: number) => Promise<void>;
  selectUser: (user: User) => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      users: [],
      selectedUser: null,
      fetchUsers: async () => {
        const res = await fetch("/api/admin/users");
        const data = await res.json();
        set({ users: data });
      },
      updateUser: async (id, updates) => {
        await fetch(`/api/admin/users/${id}`, {
          method: "PUT",
          body: JSON.stringify(updates),
        });
        set((state) => ({
          users: state.users.map((u) =>
            u.id === id ? { ...u, ...updates } : u
          ),
        }));
      },
      deleteUser: async (id) => {
        await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
        set((state) => ({
          users: state.users.filter((u) => u.id !== id),
        }));
      },
      selectUser: (user) => set({ selectedUser: user }),
    }),
    { name: "user-store" }
  )
);
```

### 🧠 useModelStore
```ts
interface AIModel {
  id: number;
  name: string;
  endpoint: string;
  status: "ACTIVE" | "DISABLED";
  threshold: number;
  lastUpdated: string;
}

interface ModelStore {
  models: AIModel[];
  fetchModels: () => Promise<void>;
  updateModel: (id: number, updates: Partial<AIModel>) => Promise<void>;
}

export const useModelStore = create<ModelStore>((set) => ({
  models: [],
  fetchModels: async () => {
    const res = await fetch("/api/admin/models");
    const data = await res.json();
    set({ models: data });
  },
  updateModel: async (id, updates) => {
    await fetch(`/api/admin/models/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
    set((state) => ({
      models: state.models.map((m) =>
        m.id === id ? { ...m, ...updates } : m
      ),
    }));
  },
}));
```

### 📊 useAdminStore
```ts
interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  flaggedMessages: number;
  totalChats: number;
  newReports: number;
  uptime: number;
}

interface AdminStore {
  stats: AdminStats | null;
  loading: boolean;
  fetchStats: () => Promise<void>;
}

export const useAdminStore = create<AdminStore>((set) => ({
  stats: null,
  loading: true,
  fetchStats: async () => {
    const res = await fetch("/api/admin/stats");
    const data = await res.json();
    set({ stats: data, loading: false });
  },
}));
```

### 🧾 useReportStore
```ts
interface Report {
  id: number;
  reporterId: number;
  chatId: number;
  message: string;
  status: "PENDING" | "REVIEWED" | "CLOSED";
}

interface ReportStore {
  reports: Report[];
  fetchReports: () => Promise<void>;
  updateReportStatus: (id: number, status: string) => Promise<void>;
}

export const useReportStore = create<ReportStore>((set) => ({
  reports: [],
  fetchReports: async () => {
    const res = await fetch("/api/admin/reports");
    const data = await res.json();
    set({ reports: data });
  },
  updateReportStatus: async (id, status) => {
    await fetch(`/api/admin/reports/${id}`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
    set((state) => ({
      reports: state.reports.map((r) =>
        r.id === id ? { ...r, status } : r
      ),
    }));
  },
}));
```

---

## 🧠 5. Component Communication Flow

```
Sidebar ──────► useAdminStore (navigation)
   │
   ▼
Dashboard Page ─► useAdminStore.fetchStats()
   │
   ▼
StatCard / ChartCard components render from store data

Users Page ────► useUserStore.fetchUsers()
Moderators Page ─► useUserStore.fetchUsers(role="MODERATOR")
Models Page ────► useModelStore.fetchModels()
Reports Page ────► useReportStore.fetchReports()
```

---

## 📊 6. Example Dashboard Data Response

```json
{
  "totalUsers": 1845,
  "activeUsers": 1332,
  "flaggedMessages": 78,
  "totalChats": 402,
  "newReports": 12,
  "uptime": 99.98
}
```

---

## 🔌 7. Real-Time Updates (WebSocket / SSE Integration)

```ts
useEffect(() => {
  const ws = new WebSocket("wss://api.safechat.ai/admin/stream");
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === "stats_update") useAdminStore.getState().fetchStats();
  };
  return () => ws.close();
}, []);
```

> 💬 The FastAPI backend emits `stats_update` events every few seconds, or on system activity (new user, flagged message, etc.).

---

## 🤩 8. Example Admin Dashboard UI Components

### `StatCard.tsx`
```tsx
<Card className="bg-white border-gray-200 rounded-2xl shadow-sm p-6">
  <h3 className="text-sm text-gray-500">{title}</h3>
  <p className="text-3xl font-semibold text-gray-900">{value}</p>
</Card>
```

### `ChartCard.tsx`
```tsx
<ResponsiveContainer width="100%" height={200}>
  <LineChart data={data}>
    <Line type="monotone" dataKey="value" stroke="#007AFF" strokeWidth={2} />
    <XAxis dataKey="name" />
    <YAxis />
  </LineChart>
</ResponsiveContainer>
```

---

## 🚀 9. Deployment & Access Control

- Admin pages protected with:
  ```tsx
  if (session?.user.role !== "ADMIN") redirect("/auth/login");
  ```
- Backend checks via NextAuth middleware
- FastAPI endpoints secured with JWT-based admin token

---

## ✅ 10. Summary

| Area | Status | Next Step |
|-------|---------|-----------|
| UI/UX Plan | ✅ Complete | Build Components |
| Zustand Stores | ✅ Defined | Implement in `store/` |
| API Routes | ✅ Planned | Implement in `/api/admin/*` |
| Backend Integration | 🧠 Pending | FastAPI endpoints + Prisma |
| Real-time Updates | 🕺 Phase 2 | WebSocket connection |
| Charts & Stats | 🕺 Phase 2 | Recharts Integration |


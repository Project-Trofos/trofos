# TROFOS Quick Reference: Feature Summary

A concise reference guide for TROFOS features and JIRA comparison.

---

## 🎯 Quick Stats

- **Total Features Implemented**: 14 major categories
- **Database Models**: 27 entities
- **JIRA Feature Parity**: ~65% (10 of 16 core features)
- **Unique Academic Features**: 5 categories

---

## ✅ What TROFOS Has

### Core Features
- ✅ User authentication (OAuth2, SAML SSO)
- ✅ Project management with GitHub integration
- ✅ Sprint management (Scrum/Agile)
- ✅ Backlog tracking (Story/Task/Bug)
- ✅ Issue tracking with cross-project support
- ✅ Scrum & StandUp boards (drag-and-drop)
- ✅ Custom workflow states per project
- ✅ Epics for backlog organization
- ✅ Comments on backlogs and issues
- ✅ File attachments
- ✅ Email notifications
- ✅ Role-based access control (RBAC)

### Analytics & Reporting
- ✅ Velocity charts
- ✅ Burndown charts
- ✅ Cumulative flow diagrams
- ✅ User and Faculty dashboards
- ✅ Team comparison graphs
- ✅ Project statistics

### Collaboration Tools
- ✅ Daily standups with notes
- ✅ Sprint retrospectives with voting
- ✅ Peer feedback collection
- ✅ Project invitations via email
- ✅ Team collaboration boards

### Academic Features (Unique)
- ✅ Course management system
- ✅ Student enrollment tracking
- ✅ Academic milestones & deadlines
- ✅ Course announcements
- ✅ Faculty oversight dashboards
- ✅ AI-powered learning assistant (beta)
- ✅ Bulk course creation via CSV

### Integrations
- ✅ GitHub webhooks
- ✅ Telegram notifications
- ✅ SendGrid email
- ✅ OpenAI integration
- ✅ External REST API with API keys

---

## ❌ What TROFOS Doesn't Have

### Missing JIRA Features
- ❌ **JQL (Jira Query Language)** - No advanced search syntax
- ❌ **Custom Fields** - Only fixed fields (type, priority, status, points)
- ❌ **Automation Rules** - No trigger-based actions
- ❌ **Components** - No module/component organization
- ❌ **Time Tracking** - No estimated time, time logged, remaining time
- ❌ **Advanced Watchers** - Basic email notifications only
- ❌ **Configurable Dashboards** - Static layouts only
- ❌ **Issue Security Schemes** - Basic project-level permissions only

### Partial Implementations
- ⚠️ **Issue Linking** - Basic only, no "blocks", "duplicates" types
- ⚠️ **Watchers** - Project-level notifications, not issue-level
- ⚠️ **Versions** - Milestones exist but not "Fix Version"/"Affects Version"

---

## 📦 Architecture

```
TROFOS
├── Backend (Node.js/Express + TypeScript)
│   ├── Prisma ORM + PostgreSQL
│   ├── 27 database models
│   └── RESTful API endpoints
├── Frontend (React + TypeScript)
│   ├── Material-UI components
│   ├── Redux-like state management
│   └── react-beautiful-dnd for boards
├── AI Insight Worker
│   └── OpenAI integration for insights
└── Integrations
    ├── GitHub webhooks
    ├── Telegram notifications
    └── SendGrid emails
```

---

## 🔑 Key Models

| Model | Purpose |
|-------|---------|
| `User` | User accounts and authentication |
| `Course` | Academic courses |
| `Project` | Team projects |
| `Sprint` | Agile sprints |
| `Backlog` | User stories, tasks, bugs |
| `BacklogStatus` | Custom workflow states |
| `Issue` | Bug/enhancement tracking |
| `Epic` | Backlog categorization |
| `StandUp` | Daily standup meetings |
| `Retrospective` | Sprint retrospectives |
| `Feedback` | Peer feedback |
| `Role` | RBAC permissions |
| `Milestone` | Deadlines |
| `Announcement` | Course communications |

---

## 🚀 Supported Workflows

### 1. Scrum/Agile Workflow
```
Course → Project → Sprint → Backlog → StandUp → Retrospective → Feedback
```

### 2. Issue Reporting Workflow
```
Project A reports Issue → Project B receives → Convert to Backlog → Resolve
```

### 3. Academic Workflow
```
Course Creation → Student Enrollment → Project Assignment → Progress Tracking
```

---

## 📊 Feature Comparison: TROFOS vs JIRA

| Category | TROFOS | JIRA |
|----------|--------|------|
| **Board Views** | Scrum + StandUp | Scrum + Kanban |
| **Custom Workflows** | ✅ Yes | ✅ Yes |
| **Search** | Basic | JQL |
| **Fields** | Fixed | Custom |
| **Time Tracking** | ❌ No | ✅ Yes |
| **Automation** | ❌ No | ✅ Yes |
| **Components** | ❌ No | ✅ Yes |
| **Course Management** | ✅ Yes | ❌ No |
| **AI Insights** | ✅ Yes | Limited |
| **Education Focus** | ✅ Strong | ❌ No |

---

## 🎓 Best Use Cases

### ✅ TROFOS is Great For:
- Academic software engineering courses
- Student team projects learning Agile
- Small to medium team collaborations
- Projects requiring course integration
- Educational institutions teaching Scrum/Kanban
- Teams wanting AI-powered insights

### ⚠️ TROFOS May Not Be Ideal For:
- Large enterprise projects (no advanced search)
- Projects requiring detailed time tracking
- Complex component-based architectures
- Heavily automated workflows
- Projects needing extensive customization

---

## 📈 Development Priorities

**Must-Have for Enterprise Use**:
1. Time tracking (estimated, logged, remaining)
2. Components/modules organization
3. Advanced search/filtering (JQL-like)
4. Custom fields per project

**Nice-to-Have Enhancements**:
5. Workflow automation rules
6. Issue-level watchers
7. Configurable dashboards
8. Advanced issue linking types

---

## 🔗 Quick Links

- **Main Documentation**: `/docs/README.md`
- **Full Feature Analysis**: `/docs/FEATURE_COMPARISON.md`
- **Contributing Guide**: Check GitHub Wiki
- **API Documentation**: Check `/packages/backend/README.md`

---

## 📞 For More Information

For detailed implementation information, database schemas, and technical deep-dives, see the full **FEATURE_COMPARISON.md** document.

---

**Last Updated**: February 2026  
**Document Version**: 1.0

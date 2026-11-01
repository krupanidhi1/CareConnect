# API Mapping — Frontend operation → Backend route

All backend routes are mounted under `/api`, so the frontend sets
`VITE_CARECONNECT_API_URL=http://localhost:5001/api`. Every route below is
implemented in this backend (no stubs, no fake responses). "Status" = implemented in source; runtime integration tests must be run locally with `npm test`.

## Authentication — `/api/auth`

| Frontend operation | Backend route | Method | Request body | Response | Required role | Status |
|---|---|---|---|---|---|---|
| register | `/auth/register` | POST | `{email,password}` | `{message,userId}` | public | ✅ |
| verify email | `/auth/verify-email` | POST | `{email,otp}` | `{accessToken,user}` + refresh cookie | public | ✅ |
| resend email OTP | `/auth/resend-email-otp` | POST | `{email}` | `{message}` | public | ✅ |
| login | `/auth/login` | POST | `{email,password}` | `{accessToken,user}` + cookie | public | ✅ |
| refresh (silent) | `/auth/refresh` | POST | cookie | `{accessToken}` (rotates cookie) | cookie | ✅ |
| logout | `/auth/logout` | POST | — | `{message}` (clears cookie) | public | ✅ |
| me | `/auth/me` | GET | — | user object | token | ✅ |
| update profile / onboarding | `/auth/profile` | PATCH | `{full_name?,phone?,location?,careconnect_role?,organization_name?}` | user object | token | ✅ |
| verify phone | `/auth/verify-phone` | POST | `{phone,otp}` | `{message}` | token | ✅ |
| resend phone OTP | `/auth/resend-phone-otp` | POST | `{phone}` | `{message}` | token | ✅ |
| forgot password | `/auth/forgot-password` | POST | `{email}` | `{message}` (generic) | public | ✅ |
| reset password | `/auth/reset-password` | POST | `{email,token,newPassword}` | `{message}` | public | ✅ |
| change password | `/auth/change-password` | POST | `{currentPassword,newPassword}` | `{message}` | token | ✅ |

## Public — `/api/public`

| Frontend operation | Backend route | Method | Response | Status |
|---|---|---|---|---|
| impact stats | `/public/stats` | GET | platform stats object | ✅ |
| featured homes | `/public/organizations/featured` | GET | `[organization]` | ✅ |
| urgent requirements | `/public/requirements/urgent` | GET | `[requirement]` | ✅ |

## Organisations — `/api/organizations` (owner operations; public browse uses `/api/public/organizations`)

| Frontend operation | Backend route | Method | Response | Required role | Status |
|---|---|---|---|---|---|
| list (search/pagination) | `/public/organizations` | GET | `{items,total,page,limit,pagination}` | public | ✅ |
| my organisation | `/organizations/me` | GET | organisation | organisation | ✅ |
| create | `/organizations` | POST | organisation | organisation | ✅ |
| submit verification | `/organizations/me/verification` | POST | organisation | organisation | ✅ |
| detail | `/public/organizations/:id` | GET | organisation | public | ✅ |
| update | `/organizations/:id` | PATCH | organisation | organisation/admin | ✅ |

## Requirements — `/api/requirements` (owner operations; public browse uses `/api/public/requirements`)

| Frontend operation | Backend route | Method | Response | Required role | Status |
|---|---|---|---|---|---|
| list | `/public/requirements` | GET | `{items,...}` | public | ✅ |
| mine | `/requirements/mine` | GET | `[requirement]` | organisation | ✅ |
| create | `/requirements` | POST | `{title,description,category,priority,quantity,unit,dueDate}` | organisation | Implemented |
| update | `/requirements/:id` | PATCH | requirement | organisation/admin | ✅ |
| remove | `/requirements/:id` | DELETE | `{message}` | organisation/admin | ✅ |

## Donations — `/api/donations`

| Frontend operation | Backend route | Method | Response | Required role | Status |
|---|---|---|---|---|---|
| create | `/donations` | POST | `{requirement_id,organization_id,type,amount,quantity,unit,note}` | donor | Implemented |
| my donations | `/donations/mine` | GET | `{items,...}` | donor | ✅ |
| received | `/donations/received` | GET | `{items,...}` | organisation | ✅ |
| list (admin) | `/donations` | GET | `{items,...}` | admin | ✅ |
| update status | `/donations/:id/status` | PATCH | donation | organisation/admin | ✅ |

## Opportunities — `/api/opportunities`

| Frontend operation | Backend route | Method | Response | Required role | Status |
|---|---|---|---|---|---|
| list | `/opportunities` | GET | `{items,...}` | token | ✅ |
| mine | `/opportunities/mine` | GET | `[opportunity]` | organisation | ✅ |
| detail | `/opportunities/:id` | GET | opportunity | token | ✅ |
| create | `/opportunities` | POST | opportunity | organisation | ✅ |
| update | `/opportunities/:id` | PATCH | opportunity | organisation/admin | ✅ |
| remove | `/opportunities/:id` | DELETE | `{message}` | organisation/admin | ✅ |

## Applications — `/api/applications`

| Frontend operation | Backend route | Method | Response | Required role | Status |
|---|---|---|---|---|---|
| apply | `/applications` | POST | `{opportunity_id,message,availability}` | volunteer | Implemented |
| my applications | `/applications/mine` | GET | `{items,...}` | volunteer | ✅ |
| received | `/applications/received` | GET | `{items,...}` | organisation | ✅ |
| update status | `/applications/:id/status` | PATCH | application | organisation/admin | ✅ |

## Notifications — `/api/notifications`

| Frontend operation | Backend route | Method | Response | Status |
|---|---|---|---|---|
| list | `/notifications` | GET | `[notification]` | ✅ |
| mark one read | `/notifications/:id/read` | PATCH | notification | ✅ |
| mark all read | `/notifications/read-all` | PATCH | `{message}` | ✅ |

## Admin — `/api/admin` (role: admin only)

| Frontend operation | Backend route | Method | Response | Status |
|---|---|---|---|---|
| stats | `/admin/stats` | GET | stats object | ✅ |
| analytics | `/admin/analytics` | GET | `{monthlyDonations,registrationTrend,byCategory,byStatus}` | ✅ |
| users | `/admin/users` | GET | `{items,...}` | ✅ |
| user | `/admin/users/:id` | GET | user | ✅ |
| organisations | `/admin/organizations` | GET | `{items,...}` | ✅ |
| review organisation | `/admin/organizations/:id/review` | PATCH | organisation | ✅ |
| donations | `/admin/donations` | GET | `{items,...}` | ✅ |
| export CSV | `/admin/reports/donations.csv` | GET | `text/csv` | ✅ |

## Contact — `/api/contact`

| Frontend operation | Backend route | Method | Body | Response | Status |
|---|---|---|---|---|---|
| submit | `/contact` | POST | `{name,email,subject,message}` | `{message}` | ✅ |

## Notes
- The frontend API client unwraps a `{ data: ... }` envelope if present, and
  accepts lists as either arrays or `{ items, total, pagination }`. Lists return
  the `{items,...}` shape so Explore pagination works.
- `/auth/me` and `/auth/profile` return the **user object directly** (not
  wrapped) — the React `AuthContext` sets it as the current user.
- Role guard: `careconnect_role` (`donor|organization|volunteer`) scopes each
  resource; `role === "admin"` is a platform admin that passes every guard.
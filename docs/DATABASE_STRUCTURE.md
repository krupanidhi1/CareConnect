# Database structure (MongoDB / Mongoose)

All schemas live in `backend/src/models/`. Documents carry Mongoose `_id`,
`createdAt`, `updatedAt`; the API exposes them as `id`, `createdAt`,
`created_date`, `updated_date`.

## User (`users`)
| Field | Type | Notes |
|---|---|---|
| email | String | unique, lowercased |
| passwordHash | String | bcrypt, select:false |
| fullName | String | |
| phone | String | |
| location | String | |
| role | String | `admin` \| `user` |
| careconnectRole | String | `donor` \| `organization` \| `volunteer` \| null |
| organizationName | String | organisation accounts |
| isVerified | Boolean | email verified |
| isPhoneVerified | Boolean | |
| refreshTokenHash | String | SHA-256 hash of the current refresh JWT; select:false |
| resetTokenHash / resetTokenExpires | | password reset |

Indexes: `email` unique, `role`, `careconnectRole`, `isVerified`.

## Organization (`organizations`)
`name`, `description`, `ownerId` (→ User, unique), `email`, `phone`,
`location`, `city`, `state`, `verificationStatus` (`pending|approved|rejected`),
`verificationReason`, `verificationDocuments[]`, `featured`, `imageUrl`.
Text index on `name, description, city, state`.

## Requirement (`requirements`)
`organizationId` (→ Organization), `title`, `description`, `category`
(`Food|Clothing|Medicines|Healthcare|Education|Furniture|Financial Support|Other`),
`priority` (`low|medium|high|urgent`), `quantity`, `unit`, `fulfilledQuantity`,
`dueDate`, `status` (`open|partial|fulfilled|closed`), `active`.
Virtual `progress` = fulfilled/quantity. Text index on `title, description`.

## Donation (`donations`)
`donorId` (→ User), `organizationId` (→ Organization), `requirementId`
(→ Requirement, optional), `type` (`money|goods|time`), `amount`, `quantity`,
`unit`, `note`, `status` (`pending|confirmed|in_transit|delivered|cancelled`),
`receiptUrl`. Compound indexes on donor+status and org+status.

## Opportunity (`opportunities`)
`organizationId`, `title`, `description`, `location`, `city`, `state`,
`category`, `date`, `endDate`, `slots`, `filledSlots`, `status`
(`open|closed`).

## Application (`applications`)
`opportunityId` (→ Opportunity), `volunteerId` (→ User), `organizationId` (→ Organization),
`message`, `availability`, `status` (`pending|accepted|rejected|completed`), `note`,
`hoursLogged`. Compound indexes volunteer+status, opportunity+status.

## Notification (`notifications`)
`userId`, `title`, `body`, `type`, `read` (bool), `link`.

## ContactMessage (`contactmessages`)
`name`, `email`, `subject`, `message`, `status` (`new|read|resolved`).

## Otp (`otps`)
`target` (email or phone), `purpose` (`email|phone|reset`), `codeHash`
(bcrypt), `consumed`, `expiresAt`, `attempts`.

## Relationships
- Organization.ownerId → User (1:1).
- Requirement.organizationId → Organization (many:1).
- Donation.donorId → User, Donation.organizationId → Organization,
  Donation.requirementId → Requirement.
- Opportunity.organizationId → Organization; Application.opportunityId →
  Opportunity; Application.volunteerId → User.

## Seed
`npm run seed` creates an admin, a donor, an organisation (with a linked
Organization doc), a volunteer, requirements, a donation, an opportunity, an
application and notifications. Demo password for all: `Password123`.
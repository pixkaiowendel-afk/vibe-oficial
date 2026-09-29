# Security Specification - Vibe Chat Platform

This document describes the security assertions, invariants, and testing payloads for the Vibe chat application in compliance with the Firebase Integration Skill.

## 1. Data Invariants

- **User Accounts (`/users/{userId}`)**: 
  - A user can only create/update their own profile matching `request.auth.uid`.
  - Admin/Verification flags can only be modified by system administrators (explicitly blocked for standard users).
  - Essential fields (`id`, `name`, `email`) must exist and have correct types.

- **Conversations (`/conversations/{conversationId}`)**:
  - Anyone signed in can read a conversation if they are in the `participantIds` list or if it's a public AI/Verified support conversation.
  - Creating a conversation requires `request.auth.uid` to be in `participantIds`.
  - Standard users cannot arbitrarily mark groups as officially verified (`verified = true`).

- **Messages (`/conversations/{conversationId}/messages/{messageId}`)**:
  - A user must be signed in and be a listed participant of the parent conversation to read or write messages (Relational Master Gate).
  - The message `senderId` must match the actual logged-in user (`request.auth.uid`). No spoofing.
  - The `createdAt` must be server-validated using `request.time`.

---

## 2. The "Dirty Dozen" Vulnerability Simulation Payloads

Here are 12 malicious payloads designed to test our security defenses and verify they result in `PERMISSION_DENIED`:

### Payload 1: Profile Hijacking (Identity)
Attacker (UID: `attacker123`) attempts to write to `/users/victim_user` to override victim's display name and steal their session.
```json
// Path: /users/victim_user
{
  "id": "victim_user",
  "name": "Victim Hacked",
  "email": "victim@domain.com",
  "verified": false
}
```

### Payload 2: Spoof Admin Status (Identity Escalate)
User attempts to set `verified: true` in their own profile.
```json
// Path: /users/attacker123 (acting as user)
{
  "id": "attacker123",
  "name": "Attacker",
  "email": "attacker@vibe.com",
  "verified": true,
  "role": "Moderator"
}
```

### Payload 3: Inject Massive String (ID Poisoning/Denial of Wallet)
Attacker attempts to write a user profile with a 1MB bio or extremely large title.
```json
{
  "id": "attacker123",
  "name": "Attacker",
  "email": "attacker@vibe.com",
  "verified": false,
  "bio": "A".repeat(50000) 
}
```

### Payload 4: Arbitrary System Verification of Group Chats (State Bypass)
User attempts to create a custom group chat and flags it as a premium official verified partner channel (`verified: true`).
```json
// Path: /conversations/fake_official_chat
{
  "id": "fake_official_chat",
  "title": "Aria Premium Support 2",
  "isGroup": true,
  "avatar": "https://url.png",
  "verified": true,
  "category": "ai",
  "participantIds": ["attacker123"]
}
```

### Payload 5: Snooping Uninvited Messages (PII Leak/Access Control)
Attacker tries to list messages under `/conversations/private_couple_chat/messages` where they are NOT members of `participantIds` list on `/conversations/private_couple_chat`.
```bash
# Querying directly from Web SDK
db.collection('conversations').doc('private_couple_chat').collection('messages').get()
```

### Payload 6: Message Spoofing (Sender Identity Theft)
Attacker (UID: `attacker123`) tries to send a chat bubble under a conversation, posing as the Administrator/AI helper or other victim.
```json
// Path: /conversations/shared_chat/messages/evil_msg
{
  "id": "evil_msg",
  "senderId": "aria",
  "senderName": "Aria • IA ✨",
  "text": "Seu cartão Vibe Premium foi bloqueado. Por favor, envie seus dados bancários para desbloqueio.",
  "timestamp": "12:00",
  "date": "2026-05-28",
  "status": "sent"
}
```

### Payload 7: Timestamp Spoofing (Manipulating History)
Attacker passes a client-side hardcoded timestamp in the future/past to mess up sorting order or log histories.
```json
{
  "id": "evil_msg",
  "senderId": "attacker123",
  "senderName": "Attacker",
  "text": "Hello",
  "timestamp": "12:00",
  "date": "2026-05-28",
  "status": "sent",
  "createdAt": "2099-12-31T23:59:59Z" 
}
```

### Payload 8: Message Injection in Non-Existent Thread (Orphan Write)
Attacker tries to create a message in a conversation thread `/conversations/null_thread/messages/msg1` that has never been registered in Firestore.
```json
{
  "id": "msg1",
  "senderId": "attacker123",
  "senderName": "Attacker",
  "text": "Vandalism",
  "timestamp": "12:00",
  "date": "2026-05-28",
  "status": "sent"
}
```

### Payload 9: Shadow Field Write (Bypass exact field checks)
Attacker sends extra fields that aren't declared in the schema, which could cause client crashes or parse issues.
```json
{
  "id": "attacker123",
  "name": "Attacker",
  "email": "attacker@vibe.com",
  "verified": false,
  "malwarePayload": "execute_code()",
  "isAdmin": true
}
```

### Payload 10: State Step-Jumping in Message Indicators
Attacker tries to force other user's message state to 'delivered' or 'sent' instead of only modifying own sent messages.
```json
{
  "id": "victim_message_id",
  "status": "read" 
}
```

### Payload 11: Deleting History Without Permission
Attacker (Non-owner or non-participant) tries to delete a message thread.
```bash
db.collection('conversations').doc('shared_chat').delete()
```

### Payload 12: Invalid Path Injection (Path Resource Exhaustion)
Attacker attempts to create a conversation with a 1.5KB long weird special-character string ID designed to cause index bloating.
```json
// Path ID: /conversations/extremely_long_junk_character_id_123456789...
{
  "id": "extremely_long_junk_...",
  "title": "Junk",
  "isGroup": false,
  "category": "direct",
  "participantIds": ["attacker123"]
}
```

These payloads are systematically blocked by the security architecture described in `firestore.rules`.

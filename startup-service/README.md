# STARTUP API

startup-service

## Getting started

In order to run the services locally, `serverless-offline` plugin is required

## Offline Invocation

```sh
npm install
serverless offline
```

---

## Functions

### GET STATUS

- **URL**: `/`
- **METHOD**: `GET`
- **PATH PARAMS**: N/A
- **QUERY PARAMS**: N/A
- **REQUEST BODY**: N/A

- **RESPONSE BODY**:

```json
    {
        "message" : "system online"
    }
```

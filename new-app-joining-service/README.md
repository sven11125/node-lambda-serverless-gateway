# NEW APP JOINING API

new-app-joining-service

## Getting started

In order to run the services locally, `serverless-offline` plugin is required

## Offline Invocation

```sh
npm install
serverless offline
```

---

## Functions

### Connect APP

- **URL**: `/apps/connect`
- **METHOD**: `POST`
- **REQUEST BODY**:

```json
{
  "appId": "DGWS4dPa8dejsDNMMlwzg",
  "userId" : "dedqediwehfouhfwe"
}
```

- **QUERY PARAMS**: N/A
- **PATH PARAMS**: N/A
- **RESPONSE BODY**

```json
{
    "message": "App connects successfully!",
    "data": {
        "appId": "DGWS4dPa8dejsDNMMlwzg",
        "userId": "dedqediwehfouhfwe",
        "connectionId": "8VREzaj-7cGuZmK8F5wYQ"
    }
}
```

### LIST OF CONNECTED APPS

- **URL**: `/apps/connected`
- **METHOD**: `GET`
- **PATH PARAMS**: N/A
- **REQUEST BODY**: N/A
- **RESPONSE BODY**:
- **QUERY PARAMS**:

```json
{
  "userId": "dedqediwehfouhfwe"
}
```


```json
{
    "message": "App retrieved successfully!",
    "data": [
        {
            "downloads": 1234,
            "updated": 1645974687283,
            "appName": "abc",
            "created": 1645974687283,
            "appId": "6",
            "status": "active"
        },
        {
            "downloads": 1234,
            "updated": 1645974676874,
            "appName": "abc",
            "created": 1645974676874,
            "appId": "4",
            "status": "active"
        },
        {
            "downloads": 1234,
            "updated": 1645974684360,
            "appName": "abc",
            "created": 1645974684360,
            "appId": "5",
            "status": "active"
        }
    ]
}
```



### DELETE

- **URL**: `/apps/connected/{appId}`
- **METHOD**: `DELETE`
- **PATH PARAMS**:

```json
{
  "appId": "DGWS4dPa8dejsDNMMlwzg"
}
```

- **QUERY PARAMS**: N/A
- **REQUEST BODY**:

```json
{
    "userId": dedqediwehfouhfwe,
}
```

- **RESPONSE BODY**:

```json
{
    "success": true,
    "message": "App removed successfully!"
}
```

### APP DETAILS

- **URL**: `/apps/connected/{appId}`
- **METHOD**: `GET`
- **PATH PARAMS**:

```json
{
  "appId": "DGWS4dPa8dejsDNMMlwzg"
}
```

- **QUERY PARAMS**: N/A
- **REQUEST BODY**: N/A
- **RESPONSE BODY**:

```json
{
    "data": {
        "appId": "1234",
        "name": "xyz",
        "tags": [],
        "category": "Gaming",
        "appUrl": "https://www.ggogle.com",
        "appCallbackUrl": "",
        "usersCount": 1,
        "downloadsCount": 4,
        "version": "4",
        "developer": "rahul",
        "status": "done",
        "isActive": "true"
    }
}
```

### SEARCH APP

- **URL**: `/apps`
- **METHOD**: `GET`
- **QUERY PARAMS**:

```json
{
  "appName": "xyz"
}
```

- **PATH PARAMS**: N/A
- **REQUEST BODY**: N/A
- **RESPONSE BODY**:

```json
{
    "data": {
        "appId": "1234234jbhb2h3",
        "name": "xyz",
        "tags": [],
        "category": "Gaming",
        "appUrl": "https://www.ggogle.com",
        "appCallbackUrl": "",
        "usersCount": 1,
        "downloadsCount": 4,
        "version": "4",
        "developer": "rahul",
        "status": "done",
        "isActive": "true"
    }
}
```
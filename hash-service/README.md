# Hash API

hash-service

## TODO
- [] Add input validation
- [] Update Api [Specification](https://growthlab.atlassian.net/wiki/spaces/EKB/pages/16384807/HASHING)

## Create Hash
`POST /hashes`
* input: data to hash
* algorithm: Optional. Any hash algorithm that node.js crypto supports full list below 
```
{
	"input": "this is my input to hash",
	"algorithm": "sha256"
}
```

Response:

```
{
    "algorithm": "sha256",
    "updatedAt": "2022-02-28T02:36:54.069Z",
    "fingerPrint": "ab62052ca21043dfe757fefa34c843785c1a9fc239f43c97d97bf62feaa8a745",
    "createdAt": "2022-02-28T02:36:54.069Z",
    "id": "f14315c6-bc26-4c17-ac6e-63a454022775"
}
```

## Verify Hash
`POST /hashes/verify`
```
{
    "fingerPrint": "ab62052ca21043dfe757fefa34c843785c1a9fc239f43c97d97bf62feaa8a745",
    "id": "84a78482-17ec-4b2d-b373-f89ebdc31651"
}
```
Response
```
{
    "algorithm": "sha256",
    "updatedAt": "2022-02-28T02:20:56.396Z",
    "fingerPrint": "ab62052ca21043dfe757fefa34c843785c1a9fc239f43c97d97bf62feaa8a745",
    "createdAt": "2022-02-28T02:20:56.396Z",
    "id": "84a78482-17ec-4b2d-b373-f89ebdc31651",
}
```

## Supported Algorithms
[ 'DSA',
'DSA-SHA',
'DSA-SHA1',
'DSA-SHA1-old',
'RSA-MD4',
'RSA-MD5',
'RSA-MDC2',
'RSA-RIPEMD160',
'RSA-SHA',
'RSA-SHA1',
'RSA-SHA1-2',
'RSA-SHA224',
'RSA-SHA256',
'RSA-SHA384',
'RSA-SHA512',
'dsaEncryption',
'dsaWithSHA',
'dsaWithSHA1',
'dss1',
'ecdsa-with-SHA1',
'md4',
'md4WithRSAEncryption',
'md5',
'md5WithRSAEncryption',
'mdc2',
'mdc2WithRSA',
'ripemd',
'ripemd160',
'ripemd160WithRSA',
'rmd160',
'sha',
'sha1',
'sha1WithRSAEncryption',
'sha224',
'sha224WithRSAEncryption',
'sha256',
'sha256WithRSAEncryption',
'sha384',
'sha384WithRSAEncryption',
'sha512',
'sha512WithRSAEncryption',
'shaWithRSAEncryption',
'ssl2-md5',
'ssl3-md5',
'ssl3-sha1',
'whirlpool' ]

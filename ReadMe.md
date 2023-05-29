Sebelum menjalankan secara lokal, silahkan instal package di directory project dengan "npm install" pada terminal kemudian ke folder config untuk melakukan beberapa configurasi

Khusus untuk API base_url/api/update

apabila request body seperti ini:

```
{
    "height": 20,
    "weight": 21,
    "birth": "2000-07-23",
    "user_id": "J5UTFCn9Eja4"
}
```

nanti resultnya akan seperti ini

```
{
  "message": "User info and user allergies added/updated successfully",
  "userInfo": {
    "height": 20,
    "weight": 21,
    "birth": "2000-07-23"
  },
  "userAllergy": []
}
```
![image](https://github.com/Nutrisee-C23-PS394/CC/assets/100499769/354050c6-48ea-4cd5-b42a-7ea1ea92b9ea)




kemudian jika request seperti ini :
```
{
    "height": 20,
    "weight": 21,
    "birth": "2000-07-23",
    "user_id": "J5UTFCn9Eja4",
    "allergy_id": [
      {
       "id": 1,
       "name": "peanut"
      }
    ],
    "allergy_name": [{
      "name": "cat"
    }]
}
```
dengan amsumsi pada table alergi sudah terdapat alergi bernama peanut dengan id = 1 dan untuk objek allergy_name untuk allergi yang belum ada di table allergi

sehingga expect resultnya seperti ini:
```
{
  "message": "User info and user allergies added/updated successfully",
  "userInfo": {
    "height": 20,
    "weight": 21,
    "birth": "2000-07-23"
  },
  "userAllergy": [
    {
      "id": 1,
      "name": "peanut"
    },
    {
      "id": 4,
      "name": "cat"
    }
  ]
}
```
pada result tersebut asumsi sudah ada 3 alergi dalam table allergy

![image](https://github.com/Nutrisee-C23-PS394/CC/assets/100499769/153f3978-9b61-42b0-9faf-3c3c64a9d73f)
table pada allergy :
![image](https://github.com/Nutrisee-C23-PS394/CC/assets/100499769/b2b3b597-0aad-488b-ba40-50bcc05e362b)

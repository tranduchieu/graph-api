# Tổ Cú Graph API

[![build status](https://gitlab.com/tocu/graph-api/badges/master/build.svg)](https://gitlab.com/tocu/graph-api/commits/master)

## Database

### Import
```
docker exec -it MONGO_CONTAINER_NAME_OR_ID /bin/bash -c "mongodump -o /data/backup"
```

### Restore
```
$ docker exec -it MONGO_CONTAINER_NAME_OR_ID /bin/bash -c "mongorestore /data/backup"
```
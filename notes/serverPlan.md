# Server Plan

### Set up Server

- init npm
- install all dependencies
- setup folder structure

### Create Folders

- create models, controllers, routes and db connection
- create server.js file with starting configurations

### DB visualization

- using dbdiagram

### Build DB models

- setup DB to have all rules and configurations

### Build Controllers/Routes

- Build using api docs
- connect Routes

## Calling JAR

- Using child_process.spawn()
- Create its own end point
- Take in args
- Use async await and send a res that sets the status to processing

### Test

- Test via postman

### DB diagram

```SQL
Table videos {
  id int [pk, increment]
  filename varchar(255) [not null]
  filepath varchar(255) [not null]
  duration float // in seconds
  uploaded_at datetime [default: `now()`]
  }

Table jobs {
    id int [pk, increment]
    job_id varchar(50) [unique, not null]
    input_video_id int
    job_status varchar(30) [not null, default: 'pending']
    progress float [default: 0.0]
    output_path varchar(255)
    started_at datetime
    completed_at datetime
}

Ref: jobs.input_video_id > videos.id \*
```

- Status: pending, running, completed, failed

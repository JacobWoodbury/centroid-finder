# Video Options

## 1. JavaCV

### Pros

- allows us to use ffmpeg to grab frames easily
- supports cross development deployment (we both use mac and windows)
- works well with maven

## Cons

- possibly difficult configuration
- dependencies on other libraries
- Based off c++ docs, could be difficult for docs

## 2. JCodec

### Pros

- No outside/external setup
- All java not taking from other languages
- Easy setup in maven

## Cons

- Limited support for codec subset
- Could be slow because its java
- might not be able to show all metadata due to restrictions

## 3. GStreamer

### Pros

- Accepts a wide amount of different platforms
- could be faster or more performative
- Can be cross platform

## Cons

- the user has to manage keeping the versions and plugins updated
- may require extra learning to understand the pipelines
- can also have a complex set up and require extra learning

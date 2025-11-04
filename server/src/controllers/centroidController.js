export const getVideos = (req, res) =>{
    const videos = null // some function to get videos
    if(videos){
        res.status(200).json(videos)
    } else {
        res.status(500).send("Error reading video directory")
    }
}

export const getThumbnail = (req, res) =>{
    const thumbnail = null // some function to get thumbnail
    if(thumbnail){
        res.status(200).json(thumbnail)
    } else {
        res.status(500).send("Error reading video directory")
    }
}

export const startVideoProcess = (req, res) =>{
   
    
}






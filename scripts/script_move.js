const container_artists = document.querySelector("#artists_container")
const container_albums = document.querySelector("#albums_container")

function activarMovimiento(container){
    let goMove = false
    let goX = 0
    let scrollX = 0

    container.addEventListener("mousedown", (go) =>{
        goMove = true
        goX = go.pageX
        scrollX = container.scrollLeft

        container.style.cursor = "grabbing"

    })

    container.addEventListener("mousemove", (go) => {
        if(!goMove) return
        const move = go.pageX - goX
        container.scrollLeft = scrollX - move
    })

    document.addEventListener("mouseup", () =>{
        goMove = false
        container.style.cursor="grab"
    })
    

}

activarMovimiento(container_artists)
activarMovimiento(container_albums)
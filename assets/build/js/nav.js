document.getElementById("burger-menu").addEventListener("click", (event) => {
    if (event.currentTarget.classList.contains("open")) {
        event.currentTarget.classList.remove("open");
        document.getElementById("list").classList.remove('active');
        document.querySelector(".overlay").style.display = "none";
    } else {
        event.currentTarget.classList.add("open");
        document.getElementById("list").classList.add('active');
        document.querySelector(".overlay").style.display = "block";
    }
});

document.querySelector(".overlay").addEventListener("click", (event) => {
    event.currentTarget.style.display = "none";
    document.getElementById("list").classList.remove('active');
    document.getElementById("burger-menu").classList.remove("open");
})
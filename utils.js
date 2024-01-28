let i = 0;
function uniqid() {
    i++;

    return i + "-" + Math.floor(Math.random() * 10000) + "-" + Date.now();
}
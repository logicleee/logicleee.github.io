/*
 */

let total = 0
let printStr = ''
let dice
let r = 1
const canvHeight = 80
const canvWidth = 450
const pips = [
    { id: 0, coords: [1, 1], faces: [2, 3, 4, 5, 6]},
    { id: 1, coords: [1, 3], faces: [6]},
    { id: 2, coords: [1, 5], faces: [4, 5, 6]},
    { id: 3, coords: [3, 5], faces: []},
    { id: 4, coords: [5, 5], faces: [2, 3, 4, 5, 6]},
    { id: 5, coords: [5, 3], faces: [6]},
    { id: 6, coords: [5, 1], faces: [4, 5, 6]},
    { id: 7, coords: [3, 1], faces: []},
    { id: 8, coords: [3, 3], faces: [1, 3, 5]}
]

function drawSquare (x,y,w,color) {
    let canv = document.getElementById("diceGameCanvas")
    let ctx = canv.getContext("2d")
    ctx.fillStyle=color
    ctx.fillRect(x,y,w,w)
}

function drawFace (offset, roll) {
        for (var j = 0; j < pips.length; j++) {
            if ( pips[j].faces.includes(roll) ) {
                console.log(pips[j].coords)
                drawSquare(((offset - 1)*75 + pips[j].coords[0]*10),(offset + pips[j].coords[1]*10),10,'lime')
            }
        }
}

const rollDie = () => Number(Math.floor(Math.random() * 6) + 1)

const rollDice = (dice) => {
    resetCanvas()
    for (i = 1; i <= dice; i++) {
        var roll = rollDie()
        total += roll
        printStr = printStr + roll
        console.log('begin: roll =' + roll)
        //console.log(printStr)
        drawFace(i,roll)
        if (i < dice) {
        printStr = printStr + ' + '
        }
    }
    if (dice > 1) {
        printStr = printStr + ' = ' + total 
        return printStr 
    }
    return total
}

function resetCanvas () {
    let canv=document.getElementById("diceGameCanvas")
    let ctx=canv.getContext("2d")
    ctx.fillStyle="black"
    ctx.fillRect(0,0,canv.width,canv.height)
}

function resetBoard () {
    createAllElements()
    resetCanvas()
    drawButtons()
    rollDice(r) 
}

function createAllElements () {
    const b = document.getElementById("diceBoard")
    b.className += 'col-md-12'

    const c = document.createElement("canvas")
    //c.innerHTML = ('id="diceGameCanvas" width="400" height="400"')
    c.id = ("diceGameCanvas")
    c.width = canvWidth
    c.height = canvHeight
    b.appendChild(c)

    const ctrls = document.createElement("div")
    ctrls.id = ("diceGameController")
    b.appendChild(ctrls)

}

function drawButtons () {
    let totalStr = ''
    var controlBoard = document.getElementById("diceGameController")
    controlBoard.className += 'col-md-4 m-md-auto'

    var btn = document.createElement("button")
    btn.innerHTML = ('+')
    btn.className += 'btn btn-sm btn-outline-success'

    btn.addEventListener("click", () => {
        if (r < 6) {
            r++
            reDrawRollBtn()
            rollDice(r)
            totalStr = ('total: ' + total)
            updateTotal(totalStr)
        }
    })
    controlBoard.appendChild(btn)

    var btn2 = document.createElement("button")
    btn2.innerHTML = ('-')
    btn2.className += 'btn btn-sm btn-outline-success'
    btn2.addEventListener("click", () => {
        if (r > 1) {
            r--
            reDrawRollBtn()
            rollDice(r)
            totalStr = ('total: ' + total)
            updateTotal(totalStr)
        }
    })
    controlBoard.appendChild(btn2)

    var rollBtn = document.createElement("button")
    rollBtn.innerHTML = ('roll ' + r)
    rollBtn.id = ("myRollButton")
    rollBtn.className += 'btn btn-sm btn-success'
    rollBtn.addEventListener("click", () => {
        rollDice(r)
        totalStr = ('total: ' + total)
        updateTotal(totalStr)
        })
    controlBoard.appendChild(rollBtn)

    var rollTotal = document.createElement("div")
    rollTotal.innerHTML = ('total: ' + total)
    rollTotal.id = ("myRollTotal")
    rollTotal.className += ''
    controlBoard.appendChild(rollTotal)

    function reDrawRollBtn() {
        document.getElementById("myRollButton").innerHTML = ('roll ' + r)
    }

    function updateTotal () {
        document.getElementById("myRollTotal").innerHTML = (totalStr)
        total = 0
    }


}

window.onload = () => resetBoard()


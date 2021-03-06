document.addEventListener('DOMContentLoaded', () => {
  const grid = document.querySelector('.grid')
  let squares = Array.from(document.querySelectorAll('.grid div'))
  const scoreDisplay = document.querySelector('#score')
  const startBtn = document.querySelector('#start-button')
  const scoreScreen = document.getElementById('scores')
  const width = 10
  let nextRandom = null
  let timerId
  let gameStart = false
  let score
  let random
  let current
  const colors = [
    'orange',
    'red',
    'purple',
    'green',
    'blue',
    'cyan',
    "pink"
  ]

  //gets and set the highscores
  let highscores
  if(localStorage.getItem("highscores") != null) highscores = JSON.parse(localStorage.getItem("highscores"));
  else highscores = [];

  //update the scorescreen
  if(scoreScreen) updateScores();

  //The Tetrominoes
  const lTetromino = [
    [1, width+1, width*2+1, 2],
    [width, width+1, width+2, width*2+2],
    [1, width+1, width*2+1, width*2],
    [width, width*2, width*2+1, width*2+2]
  ]

  const zTetromino = [
    [0,width,width+1,width*2+1],
    [width+1, width+2,width*2,width*2+1],
    [0,width,width+1,width*2+1],
    [width+1, width+2,width*2,width*2+1]
  ]

  const tTetromino = [
    [1,width,width+1,width+2],
    [1,width+1,width+2,width*2+1],
    [width,width+1,width+2,width*2+1],
    [1,width,width+1,width*2+1]
  ]

  const oTetromino = [
    [0,1,width,width+1],
    [0,1,width,width+1],
    [0,1,width,width+1],
    [0,1,width,width+1]
  ]

  const iTetromino = [
    [1,width+1,width*2+1,width*3+1],
    [width,width+1,width+2,width+3],
    [1,width+1,width*2+1,width*3+1],
    [width,width+1,width+2,width+3]
  ]

  const RLTetromino = [
    [1, width+1, width*2+1, width*0-0],
    [width+2, width*2, width*2+1, width*2+2],
    [1, width+1, width*2+1, width*2+2],
    [width, width+1, width+2, width*2+0]
    
  ]

  const RZTetromino = [
    [1,width,width+1,width*2+0],
    [width+1, width*2+2,width*1,width*2+1],
    [1,width,width+1,width*2+0],
    [width+1, width*2+2,width*1,width*2+1]
  ]
  const theTetrominoes = [lTetromino, zTetromino, tTetromino, oTetromino, iTetromino, RLTetromino, RZTetromino]

  let currentPosition = 4
  let currentRotation = 0

  console.log(theTetrominoes[0][0])

  //draw the Tetromino
  function draw() {
    //clear all outlined squares
    squares.forEach(index => {if(index.classList.contains('outline')) index.classList.remove('outline')})

    current.forEach(index => {
      squares[currentPosition + index].classList.add('tetromino')
      squares[currentPosition + index].style.backgroundColor = colors[random]
    })

    drawGhost()
  }

  //undraw the Tetromino
  function undraw() {
    current.forEach(index => {
      squares[currentPosition + index].classList.remove('tetromino')
      squares[currentPosition + index].style.backgroundColor = ''
    })
  }

  function drawGhost() {
    if(!gameStart) return;
    let drawn = false
    let index = currentPosition - (currentPosition % width)
    let ghost = current.map(x => {return x + index + (currentPosition % width)})
    while(!drawn){
      if(ghost.some(i => squares[i].classList.contains('taken'))){
        index -= width
        ghost = current.map(x => {return x + index + (currentPosition % width)})
        drawn = true
      }
      else{
        index += width
        ghost = current.map(x => {return x + index + (currentPosition % width)})
      }
    }
    ghost.forEach(i =>{squares[i].classList.add('outline')})
  }

  //assign functions to keyCodes
  function control(e) {
    if(gameStart) {
      if(timerId) {
        if(e.keyCode === 37) {
          moveLeft()
        } else if (e.keyCode === 38) {
          rotate()
        } else if (e.keyCode === 39) {
          moveRight()
        } else if (e.keyCode === 40) {
          moveDown()
        } else if (e.keyCode === 32) {
          while(!moveDown());
        }
      }
      if (e.keyCode === 80) {
        pause()
      }
    }
  }
  document.addEventListener('keydown', control)

  //move down function
  //returns true if the teromino has stopped false otherwise
  function moveDown() {
    undraw()
    currentPosition += width
    draw()
    return freeze()
  }

  //freeze function 
  //returns true if the teromino has stopped false otherwise
  function freeze() {
    if(current.some(index => squares[currentPosition + index + width].classList.contains('taken'))) {
      current.forEach(index => squares[currentPosition + index].classList.add('taken'))
      //start a new tetromino falling
      random = nextRandom
      nextRandom = Math.floor(Math.random() * theTetrominoes.length)
      current = theTetrominoes[random][currentRotation]
      currentPosition = 4
      gameOver()
      draw()
      displayShape()
      addScore()
      
      return true
    }
    return false
  }

  //move the tetromino left, unless is at the edge or there is a blockage
  function moveLeft() {
    undraw()
    const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0)
    if(!isAtLeftEdge) currentPosition -=1
    if(current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
      currentPosition +=1
    }
    draw()
    freeze()
  }

  //move the tetromino right, unless is at the edge or there is a blockage
  function moveRight() {
    undraw()
    const isAtRightEdge = current.some(index => (currentPosition + index) % width === width -1)
    if(!isAtRightEdge) currentPosition +=1
    if(current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
      currentPosition -=1
    }
    draw()
    freeze()
  }

  
  ///FIX ROTATION OF TETROMINOS A THE EDGE 
  function isAtRight() {
    return current.some(index=> (currentPosition + index + 1) % width === 0)  
  }
  
  function isAtLeft() {
    return current.some(index=> (currentPosition + index) % width === 0)
  }
  
  function checkRotatedPosition(P){
    P = P || currentPosition       //get current position.  Then, check if the piece is near the left side.
    if ((P+1) % width < 4) {         //add 1 because the position index can be 1 less than where the piece is (with how they are indexed).     
      if (isAtRight()){            //use actual position to check if it's flipped over to right side
        currentPosition += 1    //if so, add one to wrap it back around
        checkRotatedPosition(P) //check again.  Pass position from start, since long block might need to move more.
        }
    }
    else if (P % width > 5) {
      if (isAtLeft()){
        currentPosition -= 1
      checkRotatedPosition(P)
      }
    }
  }
  
  //rotate the tetromino
  function rotate() {
    undraw()
    currentRotation ++
    if(currentRotation === current.length) { //if the current rotation gets to 4, make it go back to 0
      currentRotation = 0
    }
    current = theTetrominoes[random][currentRotation]
    checkRotatedPosition()
    draw()
  }
  /////////

  
  
  //show up-next tetromino in mini-grid display
  const displaySquares = document.querySelectorAll('.mini-grid div')
  const displayWidth = 4
  const displayIndex = 0


  //the Tetrominos without rotations
  const upNextTetrominoes = [
    [1, displayWidth+1, displayWidth*2+1, 2], //lTetromino
    [0, displayWidth, displayWidth+1, displayWidth*2+1], //zTetromino
    [1, displayWidth, displayWidth+1, displayWidth+2], //tTetromino
    [0, 1, displayWidth, displayWidth+1], //oTetromino
    [1, displayWidth+1, displayWidth*2+1, displayWidth*3+1], //iTetromino
    [1, displayWidth+1, displayWidth*2+1, 0-0], //RLTetromino
    [1, displayWidth, displayWidth+1, displayWidth*2+0] //RZTetromino
  ]

  //display the shape in the mini-grid display
  function displayShape() {
    if(!gameStart) return;
    //remove any trace of a tetromino form the entire grid
    displaySquares.forEach(square => {
      square.classList.remove('tetromino')
      square.style.backgroundColor = ''
    })
    upNextTetrominoes[nextRandom].forEach( index => {
      displaySquares[displayIndex + index].classList.add('tetromino')
      displaySquares[displayIndex + index].style.backgroundColor = colors[nextRandom]
    })
  }

  //starts the game on the first press of the start button
  if(startBtn){
    startBtn.addEventListener('click', () => {
      if(!gameStart) {
        gameStart = true
        score = 0
        scoreDisplay.innerHTML = score
        //randomly select a Tetromino and its first rotation
        random = Math.floor(Math.random()*theTetrominoes.length)
        current = theTetrominoes[random][currentRotation]
        for(let i=0; i<200; i++){
          if(squares[i].classList.contains('tetromino') || squares[i].classList.contains('taken')){
            squares[i].classList.remove('taken')
            squares[i].classList.remove('tetromino')
            squares[i].style.backgroundColor = ''
          }
        }
        pause()
      }
    })
  }

  //pause or unpause the game
  function pause(){
    if (timerId) {
      clearInterval(timerId)
      timerId = null
    } else {
      draw()
      timerId = setInterval(moveDown, 1000)
      if(!nextRandom) nextRandom = Math.floor(Math.random()*theTetrominoes.length)
      displayShape()
    }
  }

  //add score
  function addScore() {
    for (let i = 0; i < 199; i +=width) {
      const row = [i, i+1, i+2, i+3, i+4, i+5, i+6, i+7, i+8, i+9]

      if(row.every(index => squares[index].classList.contains('taken'))) {
        undraw()
        score +=10
        scoreDisplay.innerHTML = score
        row.forEach(index => {
          squares[index].classList.remove('taken')
          squares[index].classList.remove('tetromino')
          squares[index].style.backgroundColor = ''
        })
        const squaresRemoved = squares.splice(i, width)
        squares = squaresRemoved.concat(squares)
        squares.forEach(cell => grid.appendChild(cell))
        draw()
      }
    }
  }

  //game over
  function gameOver() {
    if(current.some(index => squares[currentPosition + index].classList.contains('taken'))) { 
      if(testscore()) scoreDisplay.innerHTML = score.toString() + " Highscore!";
      else            scoreDisplay.innerHTML = score.toString() + " Game Over!";
      clearInterval(timerId)
      timerId = null
      nextRandom = null
      gameStart = false 
    }
  }

  //adds the score to highscores if the ending score was a highscore
  function testscore(){
    if(highscores.length < 5) {
      highscores.push(score)
      highscores.sort(function(a, b){return b - a})
      localStorage.setItem('highscores', JSON.stringify(highscores))
      return true
    }
    else if(score > highscores[highscores.length-1]){
      highscores.push(score)
      highscores.sort(function(a, b){return b - a})
      highscores.pop()
      localStorage.setItem('highscores', JSON.stringify(highscores))
      return true
    }
    return false
  }

  function updateScores(){
    for(let i=0; i<highscores.length; i++){
      document.getElementById("score-" + i).innerHTML = highscores[i]
    }
  }
})
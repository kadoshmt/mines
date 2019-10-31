import Field from "./components/Field"

// Função que cria o tabuleiro
const createBoard = (rows, columns) => {
    return Array(rows).fill(0).map((_, row) => {
        return Array(columns).fill(0).map((_, column) => {
            return {
                row, 
                column,
                opened: false,
                flagged: false,
                minned: false,
                exploded: false,
                nearMines: 0
            }
        })

    })
}

// Função para espalhar as minas
const spreadMines = (board, minesAmount) => {
    const rows = board.length
    const columns = board[0].length
    let minesPlanted = 0

    // sorteia um campo e planta uma mina até que o numero de minas seja igual a minesAmount
    while (minesPlanted < minesAmount) {
        const rowSel = parseInt(Math.random() * rows, 10)
        const columnSel = parseInt(Math.random() * columns, 10)

        if( !board[rowSel][columnSel].mined ) {
            board[rowSel][columnSel].mined = true
            minesPlanted++
        }
    }
}

const createMinedBoard = (rows, columns, minesAmount) => {
    const board = createBoard(rows, columns)
    spreadMines(board, minesAmount)
    return board
}

const cloneBoard = board => {
    return board.map(rows => {
        return rows.map(field => {
            return { ...field }
        })
    })
}

const getNeighbors = (board, row, column) => {
    const neighbors = []
    const rows = [ row -1, row, row +1 ]
    const columns = [ column -1, column, column +1 ]
    rows.forEach( r => {
        columns.forEach( c => {
            const different = r !== row || c !== column 
            const validRow = r >= 0 && r < board.length
            const validColumn = c >= 0 && c < board[0].length
            if( different && validRow && validColumn ) {
                neighbors.push(board[r][c])          
            }
        })
    })
    return neighbors
}

const safeNeighborhood = (board, row, column) => {
    const safes = (result, neighbor) => result && !neighbor.mined
    return getNeighbors(board, row, column).reduce(safes, true)
}

const openField = (board, row, column) => {
    const field = board[row][column]

    // se o campo não estiver aberto
    if (!field.opened) { 
        field.opened = true
        if (field.mined) { // se o campó for uam mina, revela ela e a explode
            field.exploded = true
        
        // se a vizinhança for segura, abre expande até que não seja mais seguro (recursivo)
        } else if (safeNeighborhood(board, row, column)) { 
            getNeighbors(board, row, column).forEach(n => openField(board, n.row, n.column))
        
        // se não for segura, revela quantas minas há na vizinhança
        }else{
            const neighbors = getNeighbors(board, row, column)
            field.nearMines = neighbors.filter(n => n.mined).length
        }
    }
}

// função que transforma o trabuleiro em um único array
const fields = board => [].concat( ...board )

// função que verifica se há pelo menos uma mina explodida no tabuleiro
const hasExplosion = board => fields(board).filter(field => field.exploded).length > 0

// verifica se há alguma mina não sinalizada ou campo que não é mina e não está aberto
const pendding = field => (field.mined && !field.flagged) || (!field.mined && !field.opened)

// função que verifica se não há pendências, sinalizando que o jogador ganhou
const wonGame = board => fields(board).filter(pendding).length === 0

// função que mostra a localização das minas assim que o usuario perde o jogo
const showMines = board => fields(board).filter(field => field.mined).forEach(field => field.opened = true)

// função usada para marcar ou desmarcar um campo com uma bandeira
const invertFlag = (board, row, column) => {
    const field = board[row][column]
    field.flagged = !Field.flagged
}

// função que retorna a quantidade de bandeiras marcadas no tabuleiro
const flagsUsed = board => fields(board).filter(field => field.flagged).length


export { 
    createMinedBoard,
    cloneBoard,
    openField,
    hasExplosion,
    wonGame,
    showMines,
    invertFlag,
    flagsUsed,
 }
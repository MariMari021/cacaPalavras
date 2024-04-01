import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';

const wordList = ['TRICÔ', 'JARDIM', 'XADREZ', 'DAMAS', 'PINTURA', 'LEITURA', 'JOGOS', 'CAMINHAR', 'CROCHÊ', 'DANÇA', 'YOGA', 'BINGO', 'BARALHO', 'MÚSICA', 'COZINHAR'];

const gridSize = 10;
const maxAttempts = 5;

const generateGrid = (words) => {
  const grid = [];
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = 0; i < gridSize; i++) {
    const row = [];
    for (let j = 0; j < gridSize; j++) {
      row.push('');
    }
    grid.push(row);
  }

  const placeWord = (word) => {
    const wordLength = word.length;
    const orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';
    let row, col;
    if (orientation === 'horizontal') {
      row = Math.floor(Math.random() * gridSize);
      col = Math.floor(Math.random() * (gridSize - wordLength + 1));
    } else {
      row = Math.floor(Math.random() * (gridSize - wordLength + 1));
      col = Math.floor(Math.random() * gridSize);
    }
    let wordFit = true;
    for (let i = 0; i < wordLength; i++) {
      if (orientation === 'horizontal') {
        if (grid[row][col + i] !== '' && grid[row][col + i] !== word.charAt(i)) {
          wordFit = false;
          break;
        }
      } else {
        if (grid[row + i][col] !== '' && grid[row + i][col] !== word.charAt(i)) {
          wordFit = false;
          break;
        }
      }
    }
    if (wordFit) {
      for (let i = 0; i < wordLength; i++) {
        if (orientation === 'horizontal') {
          grid[row][col + i] = word.charAt(i);
        } else {
          grid[row + i][col] = word.charAt(i);
        }
      }
    } else {
      placeWord(word); // Try placing the word again
    }
  };

  // Place words in grid
  words.forEach(placeWord);

  // Fill empty cells with random letters
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      if (grid[i][j] === '') {
        const letter = letters.charAt(Math.floor(Math.random() * letters.length));
        grid[i][j] = letter;
      }
    }
  }

  return grid;
};

const HuntWordsGame = () => {
  const [grid, setGrid] = useState([]);
  const [attempts, setAttempts] = useState(maxAttempts);
  const [foundWords, setFoundWords] = useState([]);
  const [selectedCells, setSelectedCells] = useState([]);
  const [currentWords, setCurrentWords] = useState([]);
  const [correctWordCoords, setCorrectWordCoords] = useState([]);

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const selectedWords = [];
    while (selectedWords.length < 5) {
      const randomIndex = Math.floor(Math.random() * wordList.length);
      const selectedWord = wordList[randomIndex];
      if (!selectedWords.includes(selectedWord)) {
        selectedWords.push(selectedWord);
      }
    }
    setCurrentWords(selectedWords);
    const generatedGrid = generateGrid(selectedWords);
    setGrid(generatedGrid);
    setAttempts(maxAttempts);
    setFoundWords([]);
    setSelectedCells([]);
    setCorrectWordCoords([]);
  };

  const checkWord = () => {
    const word = selectedCells.map(cell => grid[cell[0]][cell[1]]).join('');
    if (currentWords.includes(word)) {
      if (!foundWords.includes(word)) {
        setFoundWords([...foundWords, word]);
        if (foundWords.length === currentWords.length - 1) {
          Alert.alert('Parabéns!', 'Você encontrou todas as palavras!');
        }
      } else {
        Alert.alert('Oops!', 'Você já encontrou esta palavra!');
      }
      setCorrectWordCoords([...correctWordCoords, ...selectedCells]);
    }
    else {
      Alert.alert('Oops!', 'Palavra não encontrada!');
      setAttempts(attempts - 1);
      if (attempts === 1) {
        Alert.alert('Game Over!', 'Suas tentativas acabaram!');
        initializeGame();
      }
    }
    setSelectedCells([]);
  };

  const handleCellPress = (row, col) => {
    if (isSelectedCell(row, col)) {
      // Se a célula já estiver selecionada, remove-a
      const updatedCells = selectedCells.filter(cell => !(cell[0] === row && cell[1] === col));
      setSelectedCells(updatedCells);
    } else if (selectedCells.length === 0 || adjacentCell(selectedCells[selectedCells.length - 1], [row, col])) {
      // Adiciona a célula apenas se estiver vazia ou adjacente à última célula selecionada
      setSelectedCells([...selectedCells, [row, col]]);
    } else {
      Alert.alert('Oops!', 'Selecione uma célula adjacente à anterior!');
    }
  };

  const isSelectedCell = (row, col) => {
    // Verifica se a célula está na lista de células selecionadas
    return selectedCells.some(cell => cell[0] === row && cell[1] === col);
  };


  const adjacentCell = (cell1, cell2) => {
    const [row1, col1] = cell1;
    const [row2, col2] = cell2;
    return Math.abs(row1 - row2) <= 1 && Math.abs(col1 - col2) <= 1;
  };

  return (
    <View style={styles.container}>
      <View style={styles.wordListContainer}>
        <Text style={styles.wordListHeader}>Palavras para encontrar:</Text>
        {currentWords.map((word, index) => (
          <Text key={index} style={[styles.wordListItem, foundWords.includes(word) && styles.foundWord]}>
            {word}
          </Text>
        ))}
      </View>
      <View style={styles.gridContainer}>
        {grid.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((cell, colIndex) => (
              <TouchableOpacity
                key={`${rowIndex}-${colIndex}`}
                style={[
                  styles.cell,
                  selectedCells.some(cell => cell[0] === rowIndex && cell[1] === colIndex) && styles.selected,
                  correctWordCoords.some(coord => coord[0] === rowIndex && coord[1] === colIndex) && styles.correctCell,
                ]}
                onPress={() => handleCellPress(rowIndex, colIndex)}>
                <Text style={styles.cellText}>{cell}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
      <TouchableOpacity style={styles.button} onPress={checkWord}>
        <Text>Verificar Palavra</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  wordListContainer: {
    marginBottom: 20,
  },
  wordListHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  wordListItem: {
    fontSize: 18,
  },
  foundWord: {
    color: 'green',
  },
  correctCell: {
    backgroundColor: 'lightgreen',
  },
  gridContainer: {
    flexDirection: 'column',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: 30,
    height: 30,
    borderWidth: 1,
    borderColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selected: {
    backgroundColor: 'yellow',
  },
  cellText: {
    fontSize: 18,
  },
  infoContainer: {
    marginVertical: 20,
  },
  button: {
    padding: 10,
    backgroundColor: 'lightblue',
    borderRadius: 5,
  },
});

export default HuntWordsGame;

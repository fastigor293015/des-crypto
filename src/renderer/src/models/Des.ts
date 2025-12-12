import { decode, encode } from 'windows-1251'

export class Des {
  static outputRows: string[] = []

  // Начальная перестановка IP
  static IP: number[] = [
    58, 50, 42, 34, 26, 18, 10, 2, 60, 52, 44, 36, 28, 20, 12, 4, 62, 54, 46, 38, 30, 22, 14, 6, 64,
    56, 48, 40, 32, 24, 16, 8, 57, 49, 41, 33, 25, 17, 9, 1, 59, 51, 43, 35, 27, 19, 11, 3, 61, 53,
    45, 37, 29, 21, 13, 5, 63, 55, 47, 39, 31, 23, 15, 7
  ]

  // Конечная перестановка IP^-1
  static FP: number[] = [
    40, 8, 48, 16, 56, 24, 64, 32, 39, 7, 47, 15, 55, 23, 63, 31, 38, 6, 46, 14, 54, 22, 62, 30, 37,
    5, 45, 13, 53, 21, 61, 29, 36, 4, 44, 12, 52, 20, 60, 28, 35, 3, 43, 11, 51, 19, 59, 27, 34, 2,
    42, 10, 50, 18, 58, 26, 33, 1, 41, 9, 49, 17, 57, 25
  ]

  // Таблица расширения E
  static E: number[] = [
    32, 1, 2, 3, 4, 5, 4, 5, 6, 7, 8, 9, 8, 9, 10, 11, 12, 13, 12, 13, 14, 15, 16, 17, 16, 17, 18,
    19, 20, 21, 20, 21, 22, 23, 24, 25, 24, 25, 26, 27, 28, 29, 28, 29, 30, 31, 32, 1
  ]

  // S-блоки
  static S_BOXES = [
    // S1
    [
      [14, 4, 13, 1, 2, 15, 11, 8, 3, 10, 6, 12, 5, 9, 0, 7],
      [0, 15, 7, 4, 14, 2, 13, 1, 10, 6, 12, 11, 9, 5, 3, 8],
      [4, 1, 14, 8, 13, 6, 2, 11, 15, 12, 9, 7, 3, 10, 5, 0],
      [15, 12, 8, 2, 4, 9, 1, 7, 5, 11, 3, 14, 10, 0, 6, 13]
    ],
    // S2
    [
      [15, 1, 8, 14, 6, 11, 3, 4, 9, 7, 2, 13, 12, 0, 5, 10],
      [3, 13, 4, 7, 15, 2, 8, 14, 12, 0, 1, 10, 6, 9, 11, 5],
      [0, 14, 7, 11, 10, 4, 13, 1, 5, 8, 12, 6, 9, 3, 2, 15],
      [13, 8, 10, 1, 3, 15, 4, 2, 11, 6, 7, 12, 0, 5, 14, 9]
    ],
    // S3
    [
      [10, 0, 9, 14, 6, 3, 15, 5, 1, 13, 12, 7, 11, 4, 2, 8],
      [13, 7, 0, 9, 3, 4, 6, 10, 2, 8, 5, 14, 12, 11, 15, 1],
      [13, 6, 4, 9, 8, 15, 3, 0, 11, 1, 2, 12, 5, 10, 14, 7],
      [1, 10, 13, 0, 6, 9, 8, 7, 4, 15, 14, 3, 11, 5, 2, 12]
    ],
    // S4
    [
      [7, 13, 14, 3, 0, 6, 9, 10, 1, 2, 8, 5, 11, 12, 4, 15],
      [13, 8, 11, 5, 6, 15, 0, 3, 4, 7, 2, 12, 1, 10, 14, 9],
      [10, 6, 9, 0, 12, 11, 7, 13, 15, 1, 3, 14, 5, 2, 8, 4],
      [3, 15, 0, 6, 10, 1, 13, 8, 9, 4, 5, 11, 12, 7, 2, 14]
    ],
    // S5
    [
      [2, 12, 4, 1, 7, 10, 11, 6, 8, 5, 3, 15, 13, 0, 14, 9],
      [14, 11, 2, 12, 4, 7, 13, 1, 5, 0, 15, 10, 3, 9, 8, 6],
      [4, 2, 1, 11, 10, 13, 7, 8, 15, 9, 12, 5, 6, 3, 0, 14],
      [11, 8, 12, 7, 1, 14, 2, 13, 6, 15, 0, 9, 10, 4, 5, 3]
    ],
    // S6
    [
      [12, 1, 10, 15, 9, 2, 6, 8, 0, 13, 3, 4, 14, 7, 5, 11],
      [10, 15, 4, 2, 7, 12, 9, 5, 6, 1, 13, 14, 0, 11, 3, 8],
      [9, 14, 15, 5, 2, 8, 12, 3, 7, 0, 4, 10, 1, 13, 11, 6],
      [4, 3, 2, 12, 9, 5, 15, 10, 11, 14, 1, 7, 6, 0, 8, 13]
    ],
    // S7
    [
      [4, 11, 2, 14, 15, 0, 8, 13, 3, 12, 9, 7, 5, 10, 6, 1],
      [13, 0, 11, 7, 4, 9, 1, 10, 14, 3, 5, 12, 2, 15, 8, 6],
      [1, 4, 11, 13, 12, 3, 7, 14, 10, 15, 6, 8, 0, 5, 9, 2],
      [6, 11, 13, 8, 1, 4, 10, 7, 9, 5, 0, 15, 14, 2, 3, 12]
    ],
    // S8
    [
      [13, 2, 8, 4, 6, 15, 11, 1, 10, 9, 3, 14, 5, 0, 12, 7],
      [1, 15, 13, 8, 10, 3, 7, 4, 12, 5, 6, 11, 0, 14, 9, 2],
      [7, 11, 4, 1, 9, 12, 14, 2, 0, 6, 10, 13, 15, 3, 5, 8],
      [2, 1, 14, 7, 4, 10, 8, 13, 15, 12, 9, 0, 3, 5, 6, 11]
    ]
  ]

  // Перестановка P
  static P: number[] = [
    16, 7, 20, 21, 29, 12, 28, 17, 1, 15, 23, 26, 5, 18, 31, 10, 2, 8, 24, 14, 32, 27, 3, 9, 19, 13,
    30, 6, 22, 11, 4, 25
  ]

  // PC-1 (перестановка сжатия для ключа)
  static PC1: number[] = [
    57, 49, 41, 33, 25, 17, 9, 1, 58, 50, 42, 34, 26, 18, 10, 2, 59, 51, 43, 35, 27, 19, 11, 3, 60,
    52, 44, 36, 63, 55, 47, 39, 31, 23, 15, 7, 62, 54, 46, 38, 30, 22, 14, 6, 61, 53, 45, 37, 29,
    21, 13, 5, 28, 20, 12, 4
  ]

  // PC-2 (перестановка сжатия для подключей)
  static PC2: number[] = [
    14, 17, 11, 24, 1, 5, 3, 28, 15, 6, 21, 10, 23, 19, 12, 4, 26, 8, 16, 7, 27, 20, 13, 2, 41, 52,
    31, 37, 47, 55, 30, 40, 51, 45, 33, 48, 44, 49, 39, 56, 34, 53, 46, 42, 50, 36, 29, 32
  ]

  // Сдвиги для генерации ключей
  static KEY_SHIFTS: number[] = [1, 1, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 1]

  static clearOutputRows(): void {
    this.outputRows = []
  }

  /**
   * Разделение бинарного числа на равные части
   */
  static splitStringByLengthRegex(str: string, length: number): string[] {
    const regex = new RegExp(`.{1,${length}}`, 'g')
    return str.match(regex) || []
  }

  /**
   * Преобразует строку в бинарный массив
   */
  static xor(firstStr: string, secondStr: string): string {
    let str = ''
    for (let j = 0; j < firstStr.length; j++) {
      str += (parseInt(firstStr[j]) ^ parseInt(secondStr[j])).toString()
    }

    return str
  }

  /**
   * Преобразует строку в бинарный массив
   */
  static stringToBinary(str: string, bitsCount: number = 8): string {
    let binary = ''
    for (let i = 0; i < str.length; i++) {
      const charCode = encode(str[i])[0]
      // @ts-ignore
      binary += (charCode as number).toString(2).padStart(bitsCount, '0')
    }
    return binary
  }

  /**
   * Преобразует бинарный массив в строку
   */
  static binaryToString(binaryStr: string, bitsCount: number = 8): string {
    let encryptedText = ''
    for (let i = 0; i < binaryStr.length; i += bitsCount) {
      const byte = binaryStr.slice(i, i + bitsCount)
      // @ts-ignore
      encryptedText += decode([parseInt(byte, 2)])
    }
    return encryptedText
  }

  /**
   * Применяет перестановку к битовой строке
   */
  static permute(bits: string, table: number[]): string {
    let result = ''
    for (let i = 0; i < table.length; i++) {
      result += bits.charAt(table[i] - 1)
    }
    return result
  }

  /**
   * Циклический сдвиг влево
   */
  static leftShift(bits: string, shifts: number): string {
    return bits.slice(shifts) + bits.slice(0, shifts)
  }

  /**
   * Генерирует 16 подключей
   */
  static generateKeys(key: string): string[] {
    // Конвертируем ключ в бинарную строку
    let keyBinary = this.stringToBinary(key, 8)
    this.outputRows.push(`Ключ: ${this.splitStringByLengthRegex(keyBinary, 8).join(' ')}`)

    // Применяем PC-1
    keyBinary = this.permute(keyBinary, this.PC1)
    this.outputRows.push(
      `Ключ после перестановки: ${this.splitStringByLengthRegex(keyBinary, 8).join(' ')}`
    )

    // Разделяем на левую и правую части
    let left = keyBinary.slice(0, 28)
    let right = keyBinary.slice(28)

    const keys: string[] = []

    // Генерируем 16 подключей
    for (let i = 0; i < 16; i++) {
      // Сдвигаем
      left = this.leftShift(left, this.KEY_SHIFTS[i])
      right = this.leftShift(right, this.KEY_SHIFTS[i])

      // Объединяем и применяем PC-2
      const combined = left + right
      const subKey = this.permute(combined, this.PC2)
      keys.push(subKey)
    }
    console.log(keys)

    return keys
  }

  /**
   * Функция Фейстеля
   */
  static feistelFunc(right: string, key: string): string {
    // Расширяем правую часть с помощью таблицы E
    const expanded = this.permute(right, this.E)

    // XOR с ключом
    const xored = this.xor(expanded, key)

    // Применяем S-блоки (упрощенно)
    let substituted = ''
    for (let i = 0; i < 8; i++) {
      const chunk = xored.slice(i * 6, i * 6 + 6)
      const row = parseInt(chunk[0] + chunk[5], 2)
      const col = parseInt(chunk.slice(1, 5), 2)
      const val = this.S_BOXES[i][row][col] // Используем только первый S-блок
      substituted += val.toString(2).padStart(4, '0')
    }

    // Применяем перестановку P
    return this.permute(substituted, this.P)
  }

  /**
   * Шифрует один 64-битный блок
   * encryptBlock("Сообщение", ["011010110101", "101101001011"])
   */
  static encryptBlock(block: string, keys: string[]): string {
    // Конвертируем блок в бинарную строку
    let blockBinary = this.stringToBinary(block, 8)
    this.outputRows.push(
      `Исходное сообщение: ${this.splitStringByLengthRegex(blockBinary, 8).join(' ')}`
    )
    // Начальная перестановка
    blockBinary = this.permute(blockBinary, this.IP)
    this.outputRows.push(
      `Начальная перестановка IP: ${this.splitStringByLengthRegex(blockBinary, 8).join(' ')}`
    )

    // Разделяем на левую и правую части
    let left = blockBinary.slice(0, 32)
    let right = blockBinary.slice(32)
    this.outputRows.push(`H: ${this.splitStringByLengthRegex(left, 8).join(' ')}`)
    this.outputRows.push(`L: ${this.splitStringByLengthRegex(right, 8).join(' ')}`)

    // 16 раундов сети Фейстеля
    for (let i = 0; i < 16; i++) {
      const outputIndex = i + 1
      this.outputRows.push(`Итерация ${outputIndex}`)
      this.outputRows.push(
        `k${outputIndex}: ${this.splitStringByLengthRegex(keys[i], 8).join(' ')}`
      )
      this.outputRows.push(`H${outputIndex}: ${this.splitStringByLengthRegex(left, 8).join(' ')}`)
      this.outputRows.push(`L${outputIndex}: ${this.splitStringByLengthRegex(right, 8).join(' ')}`)
      const temp = right
      const feistelResult = this.feistelFunc(right, keys[i])
      this.outputRows.push(
        `f(L${outputIndex},k${outputIndex}): ${this.splitStringByLengthRegex(feistelResult, 8).join(' ')}`
      )

      // XOR левой части с результатом функции Фейстеля
      const newRight = this.xor(left, feistelResult)
      this.outputRows.push(
        `H${i + 1}⨁f${i + 1}: ${this.splitStringByLengthRegex(newRight, 8).join(' ')}`
      )

      right = newRight
      left = temp
    }

    this.outputRows.push(`H17: ${this.splitStringByLengthRegex(left, 8).join(' ')}`)
    this.outputRows.push(`L17: ${this.splitStringByLengthRegex(right, 8).join(' ')}`)

    // Объединяем (после последнего раунда не меняем местами)
    const combined = right + left
    this.outputRows.push(
      `Сообщение после цикла преобразований: ${this.splitStringByLengthRegex(combined, 8).join(' ')}`
    )

    // Финальная перестановка
    const encryptedBinary = this.permute(combined, this.FP)
    this.outputRows.push(
      `Конечная перестановка IP-1: ${this.splitStringByLengthRegex(encryptedBinary, 8).join(' ')}`
    )

    // Конвертируем бинарную строку обратно в строку и возвращаем
    return this.binaryToString(encryptedBinary, 8)
  }

  /**
   * Шифрование в режиме ECB
   */
  static encryptECB(
    plaintext: string,
    key: string,
    returnMessage: boolean = false
  ): string[] | string {
    if (!returnMessage) {
      this.clearOutputRows()
    }
    this.outputRows.push('Шифрование:')
    this.outputRows.push(`Исходный текст: ${plaintext}`)

    // Добавляем паддинг PKCS#7
    const blockSize = 8
    const padding = blockSize - (plaintext.length % blockSize)
    const paddedText = padding === 8 ? plaintext : plaintext + padding.toString().repeat(padding)
    if (padding !== 8) {
      this.outputRows.push(`С паддингом: ${paddedText}`)
    }

    // Генерируем подключи
    const keys = this.generateKeys(key)

    // Шифруем каждый блок
    let ciphertext = ''
    for (let i = 0; i < paddedText.length; i += blockSize) {
      const outputIndex = i / 8 + 1
      this.outputRows.push(`Блок ${outputIndex}`)
      const block = paddedText.slice(i, i + blockSize)
      ciphertext += this.encryptBlock(block, keys)
    }

    this.outputRows.push(`Зашифрованное сообщение: ${ciphertext}`)

    return returnMessage ? ciphertext : this.outputRows
  }

  /**
   * Дешифрование в режиме ECB
   */
  static decryptECB(
    ciphertext: string,
    key: string,
    returnMessage: boolean = false
  ): string[] | string {
    if (!returnMessage) {
      this.clearOutputRows()
    }
    this.outputRows.push('Дешифрование:')
    this.outputRows.push(`Исходное сообщение: ${ciphertext}`)

    // Генерируем подключи в обратном порядке
    const keys = this.generateKeys(key).reverse()

    // Дешифруем каждый блок
    let plaintext = ''
    for (let i = 0; i < ciphertext.length; i += 8) {
      const block = ciphertext.slice(i, i + 8)
      plaintext += this.encryptBlock(block, keys)
    }

    // Удаляем паддинг PKCS#7
    const padding = parseInt(plaintext[plaintext.length - 1])
    if (padding >= 1 && padding <= 7) {
      plaintext = plaintext.slice(0, plaintext.length - padding)
    }
    this.outputRows.push(`Расшифрованное сообщение: ${plaintext}`)
    return returnMessage ? plaintext : this.outputRows
  }

  /**
   * Шифрование в режиме CBC
   */
  static encryptCBC(plaintext: string, key: string, ivKey: string): string[] {
    this.clearOutputRows()
    this.outputRows.push('Шифрование:')
    this.outputRows.push(`Исходный текст: ${plaintext}`)

    // Добавляем паддинг PKCS#7
    const blockSize = 8
    const padding = blockSize - (plaintext.length % blockSize)
    const paddedText = padding === 8 ? plaintext : plaintext + padding.toString().repeat(padding)
    if (padding !== 8) {
      this.outputRows.push(`С паддингом: ${paddedText}`)
    }

    // Генерируем подключи
    const keys = this.generateKeys(key)

    // Шифруем каждый блок
    let ciphertext = ''
    let ivKeyBuffer = ivKey
    for (let i = 0; i < paddedText.length; i += blockSize) {
      const outputIndex = i / 8 + 1
      const block = paddedText.slice(i, i + blockSize)
      const summary = this.xor(this.stringToBinary(ivKeyBuffer, 8), this.stringToBinary(block, 8))
      this.outputRows.push(
        `C${outputIndex - 1}: ${this.splitStringByLengthRegex(this.stringToBinary(ivKeyBuffer, 8), 8).join(' ')}`
      )
      this.outputRows.push(
        `T${outputIndex}: ${this.splitStringByLengthRegex(this.stringToBinary(block, 8), 8).join(' ')}`
      )
      this.outputRows.push(
        `C${outputIndex - 1}⨁T${outputIndex}: ${this.splitStringByLengthRegex(summary, 8).join(' ')}`
      )
      this.outputRows.push(`Блок ${outputIndex}`)
      const encryptedBlock = this.encryptBlock(this.binaryToString(summary, 8), keys)
      ciphertext += encryptedBlock
      ivKeyBuffer = encryptedBlock
    }

    this.outputRows.push(`Зашифрованное сообщение: ${ciphertext}`)

    return this.outputRows
  }

  /**
   * Дешифрование в режиме CBC
   */
  static decryptCBC(ciphertext: string, key: string, ivKey: string): string[] {
    this.clearOutputRows()
    this.outputRows.push('Дешифрование:')
    this.outputRows.push(`Исходное сообщение: ${ciphertext}`)

    // Генерируем подключи в обратном порядке
    const keys = this.generateKeys(key).reverse()

    // Дешифруем каждый блок
    let plaintext = ''
    let ivKeyBuffer = ivKey
    for (let i = 0; i < ciphertext.length; i += 8) {
      const outputIndex = i / 8 + 1
      const block = ciphertext.slice(i, i + 8)
      this.outputRows.push(
        `C${outputIndex - 1}: ${this.splitStringByLengthRegex(this.stringToBinary(ivKeyBuffer, 8), 8).join(' ')}`
      )
      this.outputRows.push(
        `C${outputIndex}: ${this.splitStringByLengthRegex(this.stringToBinary(block, 8), 8).join(' ')}`
      )
      this.outputRows.push(`Блок ${outputIndex}`)
      const decryptedBlock = this.encryptBlock(block, keys)
      const summary = this.xor(
        this.stringToBinary(ivKeyBuffer, 8),
        this.stringToBinary(decryptedBlock, 8)
      )
      this.outputRows.push(
        `DES-ECB(C${outputIndex}): ${this.splitStringByLengthRegex(this.stringToBinary(decryptedBlock, 8), 8).join(' ')}`
      )
      this.outputRows.push(
        `C${outputIndex - 1}⨁DES-ECB(C${outputIndex}): ${this.splitStringByLengthRegex(summary, 8).join(' ')}`
      )
      plaintext += this.binaryToString(summary, 8)
      ivKeyBuffer = block
    }

    // Удаляем паддинг PKCS#7
    const padding = parseInt(plaintext[plaintext.length - 1])
    if (padding >= 1 && padding <= 7) {
      plaintext = plaintext.slice(0, plaintext.length - padding)
    }
    this.outputRows.push(`Расшифрованное сообщение: ${plaintext}`)
    return this.outputRows
  }

  /**
   * Шифрование в режиме EEE3
   */
  static encryptEEE3(plaintext: string, key1: string, key2: string, key3: string): string[] {
    this.clearOutputRows()
    this.outputRows.push('Шаг 1:')
    let message = this.encryptECB(plaintext, key1, true) as string
    this.outputRows.push('Шаг 2:')
    message = this.encryptECB(message, key2, true) as string
    this.outputRows.push('Шаг 3:')
    this.encryptECB(message, key3, true) as string

    return this.outputRows
  }

  /**
   * Дешифрование в режиме EEE3
   */
  static decryptEEE3(ciphertext: string, key1: string, key2: string, key3: string): string[] {
    this.clearOutputRows()
    this.outputRows.push('Шаг 1:')
    let message = this.decryptECB(ciphertext, key3, true) as string
    this.outputRows.push('Шаг 2:')
    message = this.decryptECB(message, key2, true) as string
    this.outputRows.push('Шаг 3:')
    this.decryptECB(message, key1, true) as string

    return this.outputRows
  }

  /**
   * Шифрование в режиме EDE3
   */
  static encryptEDE3(plaintext: string, key1: string, key2: string, key3: string): string[] {
    this.clearOutputRows()
    this.outputRows.push('Шаг 1:')
    let message = this.encryptECB(plaintext, key1, true) as string
    this.outputRows.push('Шаг 2:')
    message = this.decryptECB(message, key2, true) as string
    this.outputRows.push('Шаг 3:')
    this.encryptECB(message, key3, true) as string

    return this.outputRows
  }

  /**
   * Дешифрование в режиме EDE3
   */
  static decryptEDE3(ciphertext: string, key1: string, key2: string, key3: string): string[] {
    this.clearOutputRows()
    this.outputRows.push('Шаг 1:')
    let message = this.decryptECB(ciphertext, key3, true) as string
    this.outputRows.push('Шаг 2:')
    message = this.encryptECB(message, key2, true) as string
    this.outputRows.push('Шаг 3:')
    this.decryptECB(message, key1, true) as string

    return this.outputRows
  }

  /**
   * Шифрование в режиме EEE2
   */
  static encryptEEE2(plaintext: string, key1: string, key2: string): string[] {
    this.clearOutputRows()
    this.outputRows.push('Шаг 1:')
    let message = this.encryptECB(plaintext, key1, true) as string
    this.outputRows.push('Шаг 2:')
    message = this.encryptECB(message, key2, true) as string
    this.outputRows.push('Шаг 3:')
    this.encryptECB(message, key1, true) as string

    return this.outputRows
  }

  /**
   * Дешифрование в режиме EEE2
   */
  static decryptEEE2(ciphertext: string, key1: string, key2: string): string[] {
    this.clearOutputRows()
    this.outputRows.push('Шаг 1:')
    let message = this.decryptECB(ciphertext, key1, true) as string
    this.outputRows.push('Шаг 2:')
    message = this.decryptECB(message, key2, true) as string
    this.outputRows.push('Шаг 3:')
    this.decryptECB(message, key1, true) as string

    return this.outputRows
  }

  /**
   * Шифрование в режиме EDE2
   */
  static encryptEDE2(plaintext: string, key1: string, key2: string): string[] {
    this.clearOutputRows()
    this.outputRows.push('Шаг 1:')
    let message = this.encryptECB(plaintext, key1, true) as string
    this.outputRows.push('Шаг 2:')
    message = this.decryptECB(message, key2, true) as string
    this.outputRows.push('Шаг 3:')
    this.encryptECB(message, key1, true) as string

    return this.outputRows
  }

  /**
   * Дешифрование в режиме EDE2
   */
  static decryptEDE2(ciphertext: string, key1: string, key2: string): string[] {
    this.clearOutputRows()
    this.outputRows.push('Шаг 1:')
    let message = this.decryptECB(ciphertext, key1, true) as string
    this.outputRows.push('Шаг 2:')
    message = this.encryptECB(message, key2, true) as string
    this.outputRows.push('Шаг 3:')
    this.decryptECB(message, key1, true) as string

    return this.outputRows
  }
}

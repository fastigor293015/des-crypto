import { Flex, Input, Select } from 'antd'
import { DefaultOptionType } from 'antd/es/select'
import { ChangeEventHandler, useEffect, useState } from 'react'

enum Encodings {
  ECB = 'ECB',
  CBC = 'CBC',
  EEE3 = 'EEE3',
  EDE3 = 'EDE3',
  EEE2 = 'EEE2',
  EDE2 = 'EDE2'
}

function App(): React.JSX.Element {
  const [inputValue, setInputValue] = useState<string>('')
  const [SelectValue, setSelectValue] = useState<Encodings>(Encodings.ECB)

  const onInputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setInputValue(e.target.value)
  }
  const onSelectChange = (value: Encodings): void => {
    setSelectValue(value)
  }

  const selectOptions: DefaultOptionType[] = [
    { value: Encodings.ECB, label: 'DES-ECB' },
    { value: Encodings.CBC, label: 'DES-CBC' },
    { value: Encodings.EEE3, label: 'EEE3' },
    { value: Encodings.EDE3, label: 'EDE3' },
    { value: Encodings.EEE2, label: 'EEE2' },
    { value: Encodings.EDE2, label: 'EDE2' }
  ]

  useEffect(() => {
    class DES {
      // Начальная перестановка IP
      static IP = [
        58, 50, 42, 34, 26, 18, 10, 2, 60, 52, 44, 36, 28, 20, 12, 4, 62, 54, 46, 38, 30, 22, 14, 6,
        64, 56, 48, 40, 32, 24, 16, 8, 57, 49, 41, 33, 25, 17, 9, 1, 59, 51, 43, 35, 27, 19, 11, 3,
        61, 53, 45, 37, 29, 21, 13, 5, 63, 55, 47, 39, 31, 23, 15, 7
      ]

      // Конечная перестановка IP^-1
      static FP = [
        40, 8, 48, 16, 56, 24, 64, 32, 39, 7, 47, 15, 55, 23, 63, 31, 38, 6, 46, 14, 54, 22, 62, 30,
        37, 5, 45, 13, 53, 21, 61, 29, 36, 4, 44, 12, 52, 20, 60, 28, 35, 3, 43, 11, 51, 19, 59, 27,
        34, 2, 42, 10, 50, 18, 58, 26, 33, 1, 41, 9, 49, 17, 57, 25
      ]

      // Таблица расширения E
      static E = [
        32, 1, 2, 3, 4, 5, 4, 5, 6, 7, 8, 9, 8, 9, 10, 11, 12, 13, 12, 13, 14, 15, 16, 17, 16, 17,
        18, 19, 20, 21, 20, 21, 22, 23, 24, 25, 24, 25, 26, 27, 28, 29, 28, 29, 30, 31, 32, 1
      ]

      // S-блоки (упрощенные - в реальности 8 разных блоков)
      static S_BOXES = [
        // S1
        [
          [14, 4, 13, 1, 2, 15, 11, 8, 3, 10, 6, 12, 5, 9, 0, 7],
          [0, 15, 7, 4, 14, 2, 13, 1, 10, 6, 12, 11, 9, 5, 3, 8],
          [4, 1, 14, 8, 13, 6, 2, 11, 15, 12, 9, 7, 3, 10, 5, 0],
          [15, 12, 8, 2, 4, 9, 1, 7, 5, 11, 3, 14, 10, 0, 6, 13]
        ]
        // S2...S8 (для простоты используем тот же)
        // В реальной реализации должны быть разные
      ]

      // Перестановка P
      static P = [
        16, 7, 20, 21, 29, 12, 28, 17, 1, 15, 23, 26, 5, 18, 31, 10, 2, 8, 24, 14, 32, 27, 3, 9, 19,
        13, 30, 6, 22, 11, 4, 25
      ]

      // PC-1 (перестановка сжатия для ключа)
      static PC1 = [
        57, 49, 41, 33, 25, 17, 9, 1, 58, 50, 42, 34, 26, 18, 10, 2, 59, 51, 43, 35, 27, 19, 11, 3,
        60, 52, 44, 36, 63, 55, 47, 39, 31, 23, 15, 7, 62, 54, 46, 38, 30, 22, 14, 6, 61, 53, 45,
        37, 29, 21, 13, 5, 28, 20, 12, 4
      ]

      // PC-2 (перестановка сжатия для подключей)
      static PC2 = [
        14, 17, 11, 24, 1, 5, 3, 28, 15, 6, 21, 10, 23, 19, 12, 4, 26, 8, 16, 7, 27, 20, 13, 2, 41,
        52, 31, 37, 47, 55, 30, 40, 51, 45, 33, 48, 44, 49, 39, 56, 34, 53, 46, 42, 50, 36, 29, 32
      ]

      // Сдвиги для генерации ключей
      static KEY_SHIFTS = [1, 1, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 1]

      /**
       * Преобразует строку в бинарный массив
       */
      static stringToBinary(str) {
        let binary = ''
        for (let i = 0; i < str.length; i++) {
          const charCode = str.charCodeAt(i)
          binary += charCode.toString(2).padStart(8, '0')
        }
        return binary
      }

      /**
       * Преобразует бинарную строку в шестнадцатеричную
       */
      static binaryToHex(binary) {
        let hex = ''
        for (let i = 0; i < binary.length; i += 4) {
          const chunk = binary.substr(i, 4)
          hex += parseInt(chunk, 2).toString(16).toUpperCase()
        }
        return hex
      }

      /**
       * Применяет перестановку к битовой строке
       */
      static permute(bits, table) {
        let result = ''
        for (let i = 0; i < table.length; i++) {
          result += bits.charAt(table[i] - 1)
        }
        return result
      }

      /**
       * Циклический сдвиг влево
       */
      static leftShift(bits, shifts) {
        return bits.substr(shifts) + bits.substr(0, shifts)
      }

      /**
       * Генерирует 16 подключей
       */
      static generateKeys(key) {
        // Конвертируем ключ в бинарную строку
        let keyBinary = ''
        for (let i = 0; i < 8; i++) {
          keyBinary += key.charCodeAt(i).toString(2).padStart(8, '0')
        }

        // Применяем PC-1
        keyBinary = this.permute(keyBinary, this.PC1)

        // Разделяем на левую и правую части
        let left = keyBinary.substr(0, 28)
        let right = keyBinary.substr(28, 28)

        const keys = []

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

        return keys
      }

      /**
       * Функция Фейстеля
       */
      static feistelFunction(right, key) {
        // Расширяем правую часть с помощью таблицы E
        const expanded = this.permute(right, this.E)

        // XOR с ключом
        let xored = ''
        for (let i = 0; i < expanded.length; i++) {
          xored += (parseInt(expanded[i]) ^ parseInt(key[i])).toString()
        }

        // Применяем S-блоки (упрощенно)
        let substituted = ''
        for (let i = 0; i < 8; i++) {
          const chunk = xored.substr(i * 6, 6)
          const row = parseInt(chunk[0] + chunk[5], 2)
          const col = parseInt(chunk.substr(1, 4), 2)
          const val = this.S_BOXES[0][row][col] // Используем только первый S-блок
          substituted += val.toString(2).padStart(4, '0')
        }

        // Применяем перестановку P
        return this.permute(substituted, this.P)
      }

      /**
       * Шифрует один 64-битный блок
       */
      static encryptBlock(block, keys) {
        // Конвертируем блок в бинарную строку
        let blockBinary = ''
        for (let i = 0; i < 8; i++) {
          blockBinary += block.charCodeAt(i).toString(2).padStart(8, '0')
        }

        // Начальная перестановка
        blockBinary = this.permute(blockBinary, this.IP)

        // Разделяем на левую и правую части
        let left = blockBinary.substr(0, 32)
        let right = blockBinary.substr(32, 32)

        // 16 раундов сети Фейстеля
        for (let i = 0; i < 16; i++) {
          const temp = right
          const feistelResult = this.feistelFunction(right, keys[i])

          // XOR левой части с результатом функции Фейстеля
          let newRight = ''
          for (let j = 0; j < 32; j++) {
            newRight += (parseInt(left[j]) ^ parseInt(feistelResult[j])).toString()
          }

          right = newRight
          left = temp
        }

        // Объединяем (после последнего раунда не меняем местами)
        const combined = right + left

        // Финальная перестановка
        const encryptedBinary = this.permute(combined, this.FP)

        // Конвертируем бинарную строку обратно в строку
        let encryptedText = ''
        for (let i = 0; i < 64; i += 8) {
          const byte = encryptedBinary.substr(i, 8)
          encryptedText += String.fromCharCode(parseInt(byte, 2))
        }

        return encryptedText
      }

      /**
       * Шифрование в режиме ECB
       */
      static encryptECB(plaintext, key) {
        // Убедимся, что ключ имеет правильную длину
        if (key.length < 8) {
          key = key.padEnd(8, '\0')
        } else if (key.length > 8) {
          key = key.substring(0, 8)
        }

        // Генерируем подключи
        const keys = this.generateKeys(key)

        // Добавляем паддинг по PKCS#7
        const blockSize = 8
        const padding = blockSize - (plaintext.length % blockSize)
        const paddedText = plaintext + String.fromCharCode(padding).repeat(padding)

        // Шифруем каждый блок
        let ciphertext = ''
        for (let i = 0; i < paddedText.length; i += blockSize) {
          const block = paddedText.substr(i, blockSize)
          ciphertext += this.encryptBlock(block, keys)
        }

        return ciphertext
      }

      /**
       * Дешифрование в режиме ECB
       */
      static decryptECB(ciphertext, key) {
        // Убедимся, что ключ имеет правильную длину
        if (key.length < 8) {
          key = key.padEnd(8, '\0')
        } else if (key.length > 8) {
          key = key.substring(0, 8)
        }

        // Генерируем подключи в обратном порядке
        const keys = this.generateKeys(key).reverse()

        // Дешифруем каждый блок
        let plaintext = ''
        for (let i = 0; i < ciphertext.length; i += 8) {
          const block = ciphertext.substr(i, 8)
          plaintext += this.encryptBlock(block, keys)
        }

        // Удаляем паддинг PKCS#7
        const padding = plaintext.charCodeAt(plaintext.length - 1)
        return plaintext.substring(0, plaintext.length - padding)
      }
    }

    // Пример использования
    function example() {
      const plaintext = 'Hello DES!'
      const key = '8bytekey'

      console.log('Исходный текст:', plaintext)
      console.log('Ключ:', key)

      // Шифрование
      const encrypted = DES.encryptECB(plaintext, key)
      // console.log('Зашифрованный текст (hex):', Buffer.from(encrypted, 'binary').toString('hex'))

      // Дешифрование
      const decrypted = DES.decryptECB(encrypted, key)
      console.log('Расшифрованный текст:', decrypted)
    }

    // Запуск примера
    example()
  }, [])

  return (
    <>
      <Flex>
        <Select
          value={SelectValue}
          onChange={onSelectChange}
          options={selectOptions}
          style={{ height: 40, borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
        />
        <Input
          placeholder="Исходное сообщение"
          value={inputValue}
          onChange={onInputChange}
          style={{ height: 40, borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
        />
      </Flex>
    </>
  )
}

export default App

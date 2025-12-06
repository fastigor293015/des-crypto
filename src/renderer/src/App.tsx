import { Button, Card, Flex, Row, Col, Input, Select, Space, Typography } from 'antd'
import { DefaultOptionType } from 'antd/es/select'
import { ChangeEventHandler, useEffect, useState } from 'react'
import { Des } from '@renderer/models/Des'
const { Paragraph } = Typography

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
  const [outputRows, setOutputRows] = useState<string[]>([])

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
    // Пример использования
    function example(): void {
      const plaintext = 'ЩетинкинИ'
      const key = '12345678'

      // Шифрование
      setOutputRows(Des.encryptECB(plaintext, key))

      // Дешифрование
      // const decrypted = Des.decryptECB(encrypted, key)
      // console.log('Расшифрованный текст:', decrypted)
    }

    console.log(example())
  }, [])

  return (
    <Row gutter={[16, 16]} justify="center" align="middle" style={{ maxWidth: 1000 }}>
      <Col span={24}>
        <Space.Compact block>
          <Select
            size="large"
            value={SelectValue}
            onChange={onSelectChange}
            options={selectOptions}
            // style={{ height: 40, borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
          />
          <Input
            size="large"
            placeholder="Исходное сообщение"
            value={inputValue}
            onChange={onInputChange}
            // style={{ height: 40, borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
          />
          <Input
            size="large"
            placeholder="Ключ"
            value={inputValue}
            onChange={onInputChange}
            // style={{ height: 40, borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
          />
        </Space.Compact>
      </Col>
      <Col span="auto">
        <Space.Compact>
          <Button size="large" variant="outlined" color="red">
            Дешифровать
          </Button>
          <Button size="large" variant="solid" color="primary">
            Шифровать
          </Button>
        </Space.Compact>
      </Col>
      <Col span={24}>
        <Card>
          {outputRows.map((item) => (
            <Paragraph key={item}>{item}</Paragraph>
          ))}
        </Card>
      </Col>
    </Row>
  )
}

export default App

import {
  message as antDesign,
  Button,
  Card,
  Row,
  Col,
  Input,
  Select,
  Space,
  Typography
} from 'antd'
import { DefaultOptionType } from 'antd/es/select'
import { ChangeEvent, useState } from 'react'
import { Des } from '@renderer/models/DesECB'
const { Paragraph } = Typography

enum Encodings {
  ECB = 'ECB',
  CBC = 'CBC',
  EEE3 = 'EEE3',
  EDE3 = 'EDE3',
  EEE2 = 'EEE2',
  EDE2 = 'EDE2'
}

enum InputKeys {
  Message = 'MESSAGE',
  Key = 'KEY'
}

enum SubmitActions {
  Encrypt = 'ENCRYPT',
  Decrypt = 'DECRYPT'
}

function App(): React.JSX.Element {
  const [messageApi, contextHolder] = antDesign.useMessage()
  const [message, setMessage] = useState<string>('Щетинкин')
  const [key, setKey] = useState<string>('12345678')
  const [SelectValue, setSelectValue] = useState<Encodings>(Encodings.ECB)
  const [outputRows, setOutputRows] = useState<string[]>([])

  const isValid = key.length === 8

  const onInputChange = (e: ChangeEvent<HTMLInputElement>, inputKey: InputKeys): void => {
    switch (inputKey) {
      case InputKeys.Message:
        setMessage(e.target.value)
        break
      case InputKeys.Key:
        setKey(e.target.value)
        break
      default:
        break
    }
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

  const onSubmit = (action: SubmitActions): void => {
    if (!isValid) {
      messageApi.open({
        type: 'error',
        content: 'Длина ключа должна составлять 8 символов!'
      })
      return
    }

    switch (action) {
      case SubmitActions.Encrypt:
        setOutputRows([...Des.encryptECB(message, key)])
        break
      case SubmitActions.Decrypt:
        setOutputRows([...Des.decryptECB(message, key)])
        break
      default:
        setOutputRows([])
        break
    }
  }

  return (
    <>
      {contextHolder}
      <Row gutter={[16, 16]} justify="center" align="middle" style={{ maxWidth: 800 }}>
        <Col span={24}>
          <Space.Compact block>
            <Select
              size="large"
              value={SelectValue}
              onChange={onSelectChange}
              options={selectOptions}
              style={{ userSelect: 'none' }}
            />
            <Input
              size="large"
              placeholder="Исходное сообщение"
              value={message}
              onChange={(e) => onInputChange(e, InputKeys.Message)}
            />
            <Input
              size="large"
              placeholder="Ключ"
              value={key}
              onChange={(e) => onInputChange(e, InputKeys.Key)}
              status={!isValid ? 'error' : ''}
            />
          </Space.Compact>
        </Col>
        <Col span="auto">
          <Space.Compact>
            <Button
              size="large"
              variant="outlined"
              color="red"
              onClick={() => onSubmit(SubmitActions.Decrypt)}
              // disabled={!isValid}
            >
              Дешифровать
            </Button>
            <Button
              size="large"
              variant="solid"
              color="primary"
              onClick={() => onSubmit(SubmitActions.Encrypt)}
              // disabled={!isValid}
            >
              Шифровать
            </Button>
          </Space.Compact>
        </Col>
        <Col span={24}>
          <Card
            styles={{ root: { overflow: 'hidden' }, body: { height: 300, overflowY: 'scroll' } }}
          >
            {outputRows.map((item, i) => (
              <Paragraph key={`${i}-${item}`}>{item}</Paragraph>
            ))}
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default App

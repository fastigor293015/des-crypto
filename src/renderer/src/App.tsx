import React, { useMemo, useState } from 'react'
import { Button, Card, Col, Form, Input, Row, Segmented, Select, Space } from 'antd'
import { createLiteralArray } from '@renderer/utils'
import { Des } from '@renderer/models/Des'
import Paragraph from 'antd/es/typography/Paragraph'

const modeValues = createLiteralArray('DES-ECB', 'DES-CBC', 'EEE3', 'EDE3', 'EEE2', 'EDE2')
type ModeValue = (typeof modeValues)[number]

const actionValues = createLiteralArray('encrypt', 'decrypt')
type ActionValue = (typeof actionValues)[number]

interface FormFields {
  mode: ModeValue
  action: ActionValue
  message: string
  key1: string
  key2: string
  key3: string
  ivKey: string
}

const defaultValues: FormFields = {
  mode: 'DES-ECB',
  action: 'encrypt',
  message: 'Щетинкин',
  key1: '12345678',
  key2: '87654321',
  key3: 'qwertyui',
  ivKey: 'iuytrewq'
}

const App: React.FC = () => {
  const [form] = Form.useForm<FormFields>()
  const message = Form.useWatch('message', form)
  const key1 = Form.useWatch('key1', form)
  const key2 = Form.useWatch('key2', form)
  const key3 = Form.useWatch('key3', form)
  const ivKey = Form.useWatch('ivKey', form)
  const mode = Form.useWatch('mode', form)
  const action = Form.useWatch('action', form)

  const [outputRows, setOutputRows] = useState<string[]>([])

  const isIvKeyFieldShown = useMemo(() => mode === 'DES-CBC', [mode])
  const isKey2FieldShown = useMemo(
    () => mode === 'EEE3' || mode === 'EDE3' || mode === 'EEE2' || mode === 'EDE2',
    [mode]
  )
  const isKey3FieldShown = useMemo(() => mode === 'EEE3' || mode === 'EDE3', [mode])

  const onSubmit: React.FormEventHandler<HTMLFormElement> = () => {
    switch (mode) {
      case 'DES-ECB':
        switch (action) {
          case 'encrypt':
            setOutputRows([...Des.encryptECB(message, key1)])
            break
          case 'decrypt':
            setOutputRows([...Des.decryptECB(message, key1)])
            break
          default:
            break
        }
        break
      case 'DES-CBC':
        switch (action) {
          case 'encrypt':
            setOutputRows([...Des.encryptCBC(message, key1, ivKey)])
            break
          case 'decrypt':
            setOutputRows([...Des.decryptCBC(message, key1, ivKey)])
            break
          default:
            break
        }
        break
      case 'EEE3':
        switch (action) {
          case 'encrypt':
            setOutputRows([...Des.encryptEEE3(message, key1, key2, key3)])
            break
          case 'decrypt':
            setOutputRows([...Des.decryptEEE3(message, key1, key2, key3)])
            break
          default:
            break
        }
        break
      case 'EDE3':
        switch (action) {
          case 'encrypt':
            setOutputRows([...Des.encryptEDE3(message, key1, key2, key3)])
            break
          case 'decrypt':
            setOutputRows([...Des.decryptEDE3(message, key1, key2, key3)])
            break
          default:
            break
        }
        break
      case 'EEE2':
        switch (action) {
          case 'encrypt':
            setOutputRows([...Des.encryptEEE2(message, key1, key2)])
            break
          case 'decrypt':
            setOutputRows([...Des.decryptEEE2(message, key1, key2)])
            break
          default:
            break
        }
        break
      case 'EDE2':
        switch (action) {
          case 'encrypt':
            setOutputRows([...Des.encryptEDE2(message, key1, key2)])
            break
          case 'decrypt':
            setOutputRows([...Des.decryptEDE2(message, key1, key2)])
            break
          default:
            break
        }
        break

      default:
        break
    }
  }

  return (
    <Row
      gutter={20}
      style={{
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'flex-start'
      }}
    >
      <Col span={12} style={{ position: 'sticky', top: 50 }}>
        <Card>
          <Form
            form={form}
            variant="outlined"
            layout="vertical"
            initialValues={defaultValues}
            onSubmitCapture={onSubmit}
          >
            <Form.Item label="Выберите алгоритм" name="mode">
              <Segmented options={modeValues} />
            </Form.Item>

            <Form.Item
              label="Сообщение"
              name="message"
              rules={[{ required: true, message: 'Заполните поле!' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label={mode === 'DES-CBC' || mode === 'DES-ECB' ? 'Ключ' : 'Ключ 1'}
              name="key1"
              rules={[
                { required: true, message: 'Заполните поле!' },
                { len: 8, message: 'Длина ключа 8 символов!' }
              ]}
            >
              <Input />
            </Form.Item>

            {isIvKeyFieldShown && (
              <Form.Item
                label="Начальный вектор"
                name="ivKey"
                rules={[
                  { required: true, message: 'Заполните поле!' },
                  { len: 8, message: 'Длина ключа 8 символов!' }
                ]}
              >
                <Input />
              </Form.Item>
            )}

            {isKey2FieldShown && (
              <Form.Item
                label="Ключ 2"
                name="key2"
                rules={[
                  { required: true, message: 'Заполните поле!' },
                  { len: 8, message: 'Длина ключа 8 символов!' }
                ]}
              >
                <Input />
              </Form.Item>
            )}

            {isKey3FieldShown && (
              <Form.Item
                label="Ключ 3"
                name="key3"
                rules={[
                  { required: true, message: 'Заполните поле!' },
                  { len: 8, message: 'Длина ключа 8 символов!' }
                ]}
              >
                <Input />
              </Form.Item>
            )}

            <Space.Compact block>
              <Form.Item name="action" label={null} style={{ flex: '1 0 auto' }}>
                <Select
                  options={[
                    { value: 'encrypt', label: 'Шифрование' },
                    { value: 'decrypt', label: 'Дешифрование' }
                  ]}
                />
              </Form.Item>
              <Form.Item label={null}>
                <Button type="primary" htmlType="submit">
                  Выполнить
                </Button>
              </Form.Item>
            </Space.Compact>
          </Form>
        </Card>
      </Col>
      {!!outputRows.length && (
        <Col span={12} style={{ height: '100%' }}>
          <Card
            styles={{
              root: { overflow: 'hidden', height: '100%' },
              body: { height: '100%', overflowY: 'auto' }
            }}
          >
            {outputRows.map((item, i) => (
              <Paragraph key={`${i}-${item}`}>{item}</Paragraph>
            ))}
          </Card>
        </Col>
      )}
    </Row>
  )
}

export default App

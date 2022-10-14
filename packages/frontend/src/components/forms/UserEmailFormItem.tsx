import React from 'react'
import { Form, Input } from 'antd'

type UserEmailFormItemProps = {
    isDisabled?: boolean;
    isRequired?: boolean;
}

export default function UserEmailFormItem({ isDisabled, isRequired } : UserEmailFormItemProps) : JSX.Element {
    return (
        <Form.Item
            label="User Email"
            name="userEmail"
            rules={isRequired ? [{required: true, message: "Please input the user's email!"}] : []}
        >
            <Input disabled={isDisabled}/>
        </Form.Item>
    )
}

UserEmailFormItem.defaultProps = {
    isDisabled: false,
    isRequired: false,
}
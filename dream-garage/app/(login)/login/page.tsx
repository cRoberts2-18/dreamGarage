'use client'

import Modal from '@/components/ui/modal'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { login } from '@/app/_user/repo'

export default function Home() {
  const [username, setUsername] = useState<string | null>(null)
  const [password, setPassword] = useState<string | null>(null)

  const submit = () => {
    login(username, password)
  }

  return (
    <Modal showModal={true} title="Dream Garage" onClose={() => null}>
      <h3 className="text-center">Login</h3>
      <div className="flex justify-center items-center h-75">
        <FieldGroup className="w-75 text-center">
          <Field>
            <FieldLabel htmlFor="fieldgroup-username">Username</FieldLabel>
            <Input
              id="fieldgroup-username"
              placeholder="username..."
              onChange={(e) => setUsername(e.currentTarget.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="fieldgroup-password">password</FieldLabel>
            <Input
              id="fieldgroup-password"
              type="password"
              placeholder="password..."
              onChange={(e) => setPassword(e.currentTarget.value)}
            />
          </Field>
          <Field>
            <Button type="submit" onClick={() => submit()}>
              Login
            </Button>
          </Field>
        </FieldGroup>
      </div>
    </Modal>
  )
}

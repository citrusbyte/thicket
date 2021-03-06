import React, { Component } from 'react'
import { Input } from 'thicket-elements'
import edit from './edit.svg'
import './Editable.css'

class Editable extends Component {

  state = { edit: false }

  render() {
    const { value, onChange } = this.props

    if (this.state.edit) {
      return <Input
        data-test="editable-input"
        onChange={onChange}
        value={value}
      />
    }

    return <div className="editable">
      {value}<img
        data-test="editable-edit"
        src={edit}
        alt="Edit"
        onClick={() => this.setState({ edit: true })}
      />
    </div>
  }
}

export default Editable

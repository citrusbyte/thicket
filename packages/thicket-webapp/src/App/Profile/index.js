import React, { Component } from 'react'
import localForage from 'localforage'
import { Button } from 'thicket-elements'
import './Profile.css'

class Profile extends Component {

  constructor(props) {
    super(props)
    this.state = { nickname: props.nickname }
  }

  componentWillReceiveProps(props) {
    this.setState({ nickname:  props.nickname })
  }

  render() {
    return <div className="profile">
      <h2>Change your Thicket nickname</h2>
      <div>You can update with your own nickname below.</div>
      <input value={this.state.nickname} onChange={e => this.setState({ nickname: e.currentTarget.value })} />
      <div>
        <Button onClick={this.close}>Cancel</Button>
        <Button onClick={this.onSave}>Save</Button>
      </div>
    </div>
  }

  close = () => this.props.history.goBack() || this.props.history.push('/')

  onSave = () => localForage.setItem('nickname', this.state.nickname).then(this.close)

}

export default Profile
import fs from 'fs'
import { promisify } from 'util'
import store from '../store'
import db from '../'
import {
  options,
  cleanup,
  getFileContents,
  GIF_HASH as PUBLICATION_HASH,
  GIF_SIZE as PUBLICATION_SIZE,
} from '../../../test/utils.js'

const TEST = 'publications'
const mock = options(TEST)
const { communities } = store
const COMMUNITY_ID = 'publications-community-id'
const CREATED_BY = 'Publications Tests'
const CAPTION = 'I am a real GIF'
const PUBLICATION = { createdBy: CREATED_BY, caption: CAPTION, src: '' }

jest.setTimeout(10000)

beforeAll(async done => {
  // cleanup previous tests
  await cleanup(TEST)
  await db._initIPFS(mock('crud'))
  await communities.post(COMMUNITY_ID)
  const src = await getFileContents(__dirname + '/gif.gif')
  PUBLICATION.src = src.toString()
  done()
})

afterAll(async done => {
  await communities.delete(COMMUNITY_ID)
  done()
})

describe('Publications', async () => {

  it('should start out with no publications', async () => {
    const community = await communities.get(COMMUNITY_ID)
    const list = await community.getAllPublications()
    expect(list).toEqual([])
  })

  it('should emit an update after a new publication post', async done => {
    expect.assertions(6)
    const instant = Date.now()
    const community = await communities.get(COMMUNITY_ID)
    const { publications } = community
    publications.once('update', async () => {
      const list = await publications.getAll()
      const [ { id, caption, createdBy, src, createdAt, ...rest } ] = list
      expect(list.length).toEqual(1)
      expect(id).toEqual(PUBLICATION_HASH)
      expect(caption).toEqual(CAPTION)
      expect(createdBy).toEqual(CREATED_BY)
      expect(createdAt).toBeGreaterThanOrEqual(instant)
      // to make sure there is nothing else there
      expect(Object.keys(rest).length).toBe(0)
      done()
    })
    await community.postPublication(PUBLICATION)
  })

  it('should get all the publications', async () => {
    const { publications } = await communities.get(COMMUNITY_ID)
    const list = await publications.getAll()
    expect(list.length).toEqual(1)
  })

  it('should get the publication’s data', async () => {
    const { publications } = await communities.get(COMMUNITY_ID)
    const {
      id,
      caption,
      createdBy,
      src,
      createdAt,
      ...rest
    } = await publications.get(PUBLICATION_HASH)
    expect(id).toEqual(PUBLICATION_HASH)
    expect(caption).toEqual(CAPTION)
    expect(createdBy).toEqual(CREATED_BY)
    // to make sure there is nothing else there
    expect(Object.keys(rest).length).toBe(0)
  })

  it('should get the publication’s metadata (no src)', async () => {
    const { publications } = await communities.get(COMMUNITY_ID)
    const {
      id,
      caption,
      createdBy,
      createdAt,
      ...rest,
    } = await publications.get(PUBLICATION_HASH)
    expect(id).toEqual(PUBLICATION_HASH)
    expect(caption).toEqual(CAPTION)
    expect(createdBy).toEqual(CREATED_BY)
    // to make sure there is nothing else there
    expect(Object.keys(rest).length).toBe(0)
  })

  it('should get the all the publication’s aggregated size', async done => {
    expect.assertions(1)
    const { publications } = await communities.get(COMMUNITY_ID)
    publications.once('update', async () => {
      const size = await publications.getSize()
      expect(size).toBe(PUBLICATION_SIZE)
      done()
    })
    // can only get size after getting publication src
    const item = await publications.get(PUBLICATION_HASH)
  })

  it('should update the publication’s caption and createdBy properties', async () => {
    const { publications } = await communities.get(COMMUNITY_ID)
    const newNickname = 'Other nickname'
    const newCaption = 'To GIF or not to GIF'
    await publications.put(PUBLICATION_HASH, { createdBy: newNickname, caption: newCaption })
    const {
      id,
      createdBy,
      caption,
      src,
      createdAt,
      ...rest,
    } = await publications.get(PUBLICATION_HASH)
    expect(caption).toEqual(newCaption)
    expect(createdBy).toEqual(newNickname)
    // to make sure there is nothing else there
    expect(Object.keys(rest).length).toBe(0)
  })
  
  it('should iemit an update when the publication’s caption and createdBy properties are updated', async done => {
    expect.assertions(3)
    const { publications } = await communities.get(COMMUNITY_ID)
    const newNickname = 'Some other nickname'
    const newCaption = ''
    publications.once('update', async () => {
      const {
        id,
        createdBy,
        caption,
        src,
        createdAt,
        ...rest,
      } = await publications.get(PUBLICATION_HASH)
      expect(caption).toEqual(newCaption)
      expect(createdBy).toEqual(newNickname)
      // to make sure there is nothing else there
      expect(Object.keys(rest).length).toBe(0)
      done()
    })
    await publications.put(PUBLICATION_HASH, { createdBy: newNickname, caption: newCaption })
  })
})

'use client'
import { useEffect, useMemo, useState } from 'react'
import {
  connectWallet,
  getAccountAndNetwork,
  readContractBalance,
  readOwner,
  sendTip,
  withdrawTips,
} from '@/lib/eth'

export default function Home() {
  const [account, setAccount] = useState<string | undefined>(undefined)
  const [chainId, setChainId] = useState<number | undefined>(undefined)
  const [chainName, setChainName] = useState<string | undefined>(undefined)
  const [balanceEth, setBalanceEth] = useState<string>('0')
  const [owner, setOwner] = useState<string>('')
  const [amount, setAmount] = useState<string>('0.01')
  const [loading, setLoading] = useState<boolean>(false)
  const [message, setMessage] = useState<string>('')

  useEffect(() => {
    refreshBasics()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function getErrorMessage(err: unknown): string {
    if (typeof err === 'string') return err
    if (err && typeof err === 'object' && 'message' in err) {
      const msg = (err as { message?: unknown }).message
      if (typeof msg === 'string') return msg
    }
    return ''
  }

  async function refreshBasics() {
    try {
      const info = await getAccountAndNetwork()
      setAccount(info.account)
      setChainId(info.chainId)
      setChainName(info.chainName)
      const [b, o] = await Promise.all([readContractBalance(), readOwner()])
      setBalanceEth(b)
      setOwner(o)
    } catch (e) {
    }
  }

  async function onConnect() {
    setLoading(true)
    setMessage('')
    try {
      const addr = await connectWallet()
      setAccount(addr)
      await refreshBasics()
      setMessage('지갑이 연결되었습니다.')
    } catch (e: unknown) {
      const msg = getErrorMessage(e) || '지갑 연결 실패'
      setMessage(msg)
    } finally {
      setLoading(false)
    }
  }

  async function onSendTip() {
    setLoading(true)
    setMessage('')
    try {
      const hash = await sendTip(amount)
      await refreshBasics()
      setMessage(`Tip 전송 완료: ${hash}`)
    } catch (e: unknown) {
      const msg = getErrorMessage(e) || 'Tip 전송 실패'
      setMessage(msg)
    } finally {
      setLoading(false)
    }
  }
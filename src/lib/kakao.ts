import axios from 'axios'

export async function sendKakaoMemo(question: string, answer: string) {
  const accessToken = process.env.KAKAO_ACCESS_TOKEN
  if (!accessToken) return

  const payload = new URLSearchParams()
  payload.append(
    'template_object',
    JSON.stringify({
      object_type: 'text',
      text: `Q: ${question}\nA: ${answer}`,
      link: {
        web_url: 'https://example.com',
        mobile_web_url: 'https://m.example.com',
      },
    })
  )

  try {
    await axios.post(
      'https://kapi.kakao.com/v2/api/talk/memo/send',
      payload.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )
  } catch (err) {
    console.error('Failed to send Kakao memo:', err)
  }
}

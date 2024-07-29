export const uploadFile = async(files: File[], type: string) => {
  const images = []

  for (const file of files) {
    const formData = new FormData()

    formData.append('file', file)
    type === 'avatar'
    ? formData.append('upload_preset', 'oxprgvqf')
    : type === 'cv'
      ? formData.append('upload_preset', 'js9qof0d')
      : type === 'category'
        ? formData.append('upload_preset', 'sebgvlmh')
        : formData.append('upload_preset', '')
    formData.append('cloud_name', 'dmgfdleea')

    try {
      const res = await fetch('https://api.cloudinary.com/v1_1/dmgfdleea/upload', {
        method: 'POST',
        body: formData
      })

      const data = await res.json()

      images.push(data.secure_url)
    } catch (err: any) {
      console.log(err)
    }
  }

  return images
}
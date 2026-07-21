export function saveToken(token){
  localStorage.setItem('ff_token', token)
}

export function getToken(){
  return localStorage.getItem('ff_token')
}

export function clearToken(){
  localStorage.removeItem('ff_token')
}

export function saveUser(user){
  localStorage.setItem('ff_user', JSON.stringify(user))
}

export function getUser(){
  const s = localStorage.getItem('ff_user')
  return s ? JSON.parse(s) : null
}

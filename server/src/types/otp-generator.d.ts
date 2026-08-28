declare module "otp-generator" {
  interface Options {
    digits?: boolean
    lowerCaseAlphabets?: boolean
    upperCaseAlphabets?: boolean
    specialChars?: boolean
  }

  function generate(length: number, options?: Options): string
  export = { generate }
}

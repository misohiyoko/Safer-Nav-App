export class LanguageDict {
  public static languageDictionary : {[word in wordDict]:string }
  public static uiLang:string
  constructor() {
    if(LanguageDict.langList.includes(navigator.language)){
        LanguageDict.uiLang = navigator.language
    }else {
      LanguageDict.uiLang = "English"
    }

  }
  public static languageDict:{[lang :string]: {[word in wordDict]:string }} = {
    "ja":{
      placeName:"目的地"
    },
    "en":{
      placeName:"Destination"
    }
  };
  public static langList = ["ja","en"]
}
type wordDict = "placeName"








import { useState, useRef, useCallback } from "react";


interface TextInfo {
    defText: string
}

//:focus-visible {
//  outline: 2px solid #C8102E;
//  outline-offset: 2px;
//}
export default function TextInput({ placeholder = "Escribe algo...", onSubmit }: {
    placeholder?: string;
    value?: string;
    onSubmit: () => void;
}) {
    const [textValue, changeText] = useState<string>("");

    return (
        //Horizontal with 40% horizontal margins
        <div className="flex items-center gap-2 mx-[40%] my-4">
            <input
                type="text"
                value={textValue}
                placeholder={placeholder}
                onChange={(e) => {changeText(e.target.value)}} 
                className=" flex-1 rounded-full p-32 border border-gray-300 bg-blue-50 px-4 py-2 text-gray-800 placeholder-gray-400 outline-none focus:border-blue-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-300"/> 
            <button 
                type="button" 
                onClick={onSubmit} 
                className=" rounded-lg border border-gray-300 bg-blue-500 px-5 py-2 text-white hover:bg-blue-600 active:bg-blue-700 transition" > 
                Mandar 
            </button> 
        </div>
    );
}
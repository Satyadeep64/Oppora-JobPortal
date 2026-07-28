import './index.css'
import App from './App.jsx'
import ReactDOM from "react-dom/client"
import { ThemeProvider } from "./context/ThemeContext.jsx";


const savedTheme = localStorage.getItem("theme");

if(savedTheme)
{
 document.documentElement.setAttribute(
    "data-theme",
    savedTheme
 );
}


ReactDOM.createRoot(
document.getElementById('root')
)
.render(

<ThemeProvider>
<App/>
</ThemeProvider>

)
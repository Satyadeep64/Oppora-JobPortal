const AIToolCard = ({
    name,
    logo,
    description,
    link
})=>{


return(

<div className="ai-card">


<div className="ai-logo">

<img src={logo} alt={name}/>
</div>

<h3>
{name}
</h3>
<p>
{description}
</p>

<a 
href={link}
target="_blank"
rel="noopener noreferrer"
>

Explore Tool →

</a>
</div>
)
}


export default AIToolCard;
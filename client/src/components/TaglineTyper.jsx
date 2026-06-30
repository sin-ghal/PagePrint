import Typewriter from "typewriter-effect"

const TaglineTyper = () => {
  return (
    <div className="text-2xl" style={{ color: "#c0392b", fontWeight: "700" }}>
     <Typewriter
              options={{
                strings: [
                  `Print Smarter. Not Harder🖨️`
                ],
                autoStart: true,
                loop: true,
                delay: 80,
                deleteSpeed: 50,
              }}
            />
    </div>
  )
}

export default TaglineTyper

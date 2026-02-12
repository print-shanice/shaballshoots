export default function About() {
  return (
    <div className="container mx-auto px-4 lg:px-6 py-16 max-w-4xl">
      <h1 className="text-5xl mb-12 tracking-wide lowercase">about</h1>
      
      <div className="space-y-12 text-stone-700 leading-relaxed">
        <section>
          <h2 className="text-3xl mb-6 text-stone-900 lowercase">me</h2>
          <p className="mb-6">
            hi i'm shanice, some of my friends call me shaball
          </p>
          <p className="mb-6">
            i'm a photophile, cinephile, bibliophile, audiophile and also sadly a computer science student 
          </p>
          <p>
            i made this website to have a collection of all the photos that i took in my 20's, i hope some of them make you feel something
          </p>
        </section>

        <section>
          <h2 className="text-3xl mb-6 text-stone-900 lowercase">why i love photography</h2>
          <p className="mb-6">
            i unfortunately gained consciousness really, really late and forgot like everything that ever happened to me before the age of ten
          </p>
          <p>
            i used to always look at photos of myself when i younger and wonder who i was back then
          </p>
          <p className="mb-6">
            my dreams, my fears, my loves and most of all, if i was anything like her
          </p>
          <p className="mb-6">
            until one day i saw this ridiculous photo of little me with a crazyyyyy ugly asian bob and i looked like dora and i looked honestly mortifying but as soon as i saw myself i felt like i knew everything about her
          </p>
          <p className="mb-6">
            when i take photos of people, i feel like i know everything about them 
          </p>
        </section>

        <section>
          <h2 className="text-3xl mb-6 text-stone-900 lowercase">inspirations</h2>
          <p>
            i like to take photos of people just doing normal things, just being themselves
          </p>
           <p className="mb-6">
            i like a little bit of blur in my photos because it makes them so nostalgic imo 
          </p>
          <p>
            i'm also superrr picky with photos so that's why there are so little here 
          </p>
        </section>

        <section>
          <h2 className="text-3xl mb-6 text-stone-900 lowercase">camera</h2>
          <p className="mb-6">
            currently i'm shooting with a sony a6000 with sigma 18-50 lens
          </p>
          <p>
            my dream cameras are ricoh gr3 and a hasselblad please feel free to paynow me 
          </p>
        </section>

        <section className="pt-6 border-t border-stone-200">
          <h2 className="text-3xl mb-6 text-stone-900 lowercase">get in touch</h2>
          <div className="flex gap-8 text-sm">
            <a 
              href="http://www.linkedin.com/in/shanice-lai-239224304" 
              className="text-stone-600 hover:text-stone-900 transition-colors lowercase tracking-wide"
            >
              linkedin
            </a>
            <span className="text-stone-300">|</span>
            <a 
              href="https://github.com/print-shanice" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-stone-600 hover:text-stone-900 transition-colors lowercase tracking-wide"
            >
              github
            </a>
          </div>
        </section>
      </div>
    </div>
  )
}

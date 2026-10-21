import {Badge} from "@/components/ui/badge"

export function getStatusBadge(status: SectionStatus){
    switch(status){
        case "active":
            return <Badge variant="success" className="bg-emerald-500/10">Active</Badge>

         case "draft":
            return <Badge variant="secondary">Draft</Badge>
            
         case "disabled":
            return <Badge variant="outline" className="text-zinc-500 ">Disabled</Badge>  
    }
}

export function getToneBadge(tone: Tone) {
    switch (tone) {
        case "strict":
            return <Badge variant="outline" className="border-red-500/30 text-red-500 bg-red-500/5">Strict</Badge>

            case "neutral":
            return <Badge variant="outline" className="border-blue-500/30 text-blue-500 bg-blue-500/5">Neutral</Badge>

            case "friendly":
            return <Badge variant="outline" className="border-indigo-500/30 text-indigo-500 bg-indigo-500/5">Friendly</Badge>

            case "empathetic":
            return <Badge variant="outline" className="border-purple-500/30 text-purple-500 bg-purple-500/5">Empathetic</Badge>
    }
}
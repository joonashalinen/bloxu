
export default function getEventsConfig() {
    return {
        redirect: [
            "GameMaster:<event>playerLeavePortal",
            "GameMaster:<event>remoteStartGame"
        ]
    };
}
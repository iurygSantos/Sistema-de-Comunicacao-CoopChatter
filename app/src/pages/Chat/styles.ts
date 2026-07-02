const styles = 
{
    // ---- Layout geral ----
    root: {
        display: "flex",
        height: "100vh",
        backgroundColor: "#0D1B2A",
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        overflow: "hidden",
    },

    // ---- Sidebar esquerda ----
    sidebar: {
        width: "220px",
        backgroundColor: "#111E2D",
        borderRight: "1px solid #1E3248",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
    },

    sidebarHeader: {
        padding: "16px",
        borderBottom: "1px solid #1E3248",
    },

    userInfo: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        marginBottom: "12px",
    },

    avatar: {
        width: "32px",
        height: "32px",
        borderRadius: "50%",
        backgroundColor: "#2E86FF",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "12px",
        fontWeight: "700",
        color: "#fff",
        flexShrink: 0,
        textTransform: "uppercase",
    },

    userName: {
        fontSize: "13px",
        fontWeight: "600",
        color: "#E8EDF2",
    },

    userUsername: {
        fontSize: "11px",
        color: "#5E7A96",
    },

    logoutBtn: {
        width: "100%",
        padding: "7px 10px",
        background: "transparent",
        border: "1px solid #1E3248",
        borderRadius: "6px",
        color: "#5E7A96",
        fontSize: "12px",
        cursor: "pointer",
        textAlign: "left",
        display: "flex",
        alignItems: "center",
        gap: "6px",
    },

    sidebarSection: {
        padding: "14px 16px 6px",
        fontSize: "10px",
        fontWeight: "600",
        color: "#2E86FF",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
    },

    userList: {
        flex: 1,
        overflowY: "auto",
        padding: "4px 8px",
    },

    userItem: (isActive) => ({
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "8px 10px",
        borderRadius: "8px",
        cursor: "pointer",
        marginBottom: "2px",
        backgroundColor: isActive ? "#1A3352" : "transparent",
        transition: "background-color 0.1s",
    }),

    onlineDot: {
        width: "8px",
        height: "8px",
        borderRadius: "50%",
        backgroundColor: "#22C55E",
        flexShrink: 0,
    },

    userItemName: (isActive) => ({
        fontSize: "13px",
        color: isActive ? "#E8EDF2" : "#C8D4E0",
        fontWeight: isActive ? "600" : "400",
    }),

    emptyList: {
        fontSize: "12px",
        color: "#3D5A78",
        padding: "12px 10px",
    },

    // ---- Área principal (chat) ----
    main: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
    },

    chatHeader: {
        padding: "14px 20px",
        borderBottom: "1px solid #1E3248",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        backgroundColor: "#111E2D",
        flexShrink: 0,
    },

    chatAvatar: {
        width: "36px",
        height: "36px",
        borderRadius: "50%",
        backgroundColor: "#1A3352",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "13px",
        fontWeight: "700",
        color: "#2E86FF",
        flexShrink: 0,
        textTransform: "uppercase",
    },

    chatName: {
        fontSize: "15px",
        fontWeight: "600",
        color: "#E8EDF2",
    },

    chatStatus: {
        fontSize: "12px",
        color: "#22C55E",
    },

    // ---- Mensagens ----
    messages: {
        flex: 1,
        overflowY: "auto",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
    },

    msgWrapper: (isMine) => ({
        display: "flex",
        flexDirection: "column",
        alignItems: isMine ? "flex-end" : "flex-start",
        alignSelf: isMine ? "flex-end" : "flex-start",
        maxWidth: "68%",
    }),

    bubble: (isMine) => ({
        padding: "10px 14px",
        borderRadius: "16px",
        borderBottomRightRadius: isMine ? "4px" : "16px",
        borderBottomLeftRadius: isMine ? "16px" : "4px",
        fontSize: "14px",
        lineHeight: "1.5",
        backgroundColor: isMine ? "#2E86FF" : "#1A2B3C",
        color: isMine ? "#fff" : "#C8D4E0",
        wordBreak: "break-word",
    }),

    msgTime: {
        fontSize: "11px",
        color: "#3D5A78",
        marginTop: "3px",
        padding: "0 4px",
    },

    // ---- Estado vazio ----
    emptyState: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        color: "#3D5A78",
    },

    emptyIcon: {
        width: "48px",
        height: "48px",
        borderRadius: "50%",
        backgroundColor: "#1A2B3C",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: "4px",
    },

    emptyTitle: {
        fontSize: "14px",
        color: "#5E7A96",
    },

    emptySubtitle: {
        fontSize: "12px",
        color: "#3D5A78",
    },

    // ---- Input de mensagem ----
    inputArea: {
        padding: "14px 16px",
        borderTop: "1px solid #1E3248",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        backgroundColor: "#111E2D",
        flexShrink: 0,
    },

    textInput: {
        flex: 1,
        backgroundColor: "#0D1B2A",
        border: "1px solid #1E3248",
        borderRadius: "8px",
        padding: "10px 14px",
        color: "#E8EDF2",
        fontSize: "14px",
        outline: "none",
    },

    sendBtn: (disabled) => ({
        width: "40px",
        height: "40px",
        backgroundColor: disabled ? "#1A3A5C" : "#2E86FF",
        border: "none",
        borderRadius: "8px",
        cursor: disabled ? "not-allowed" : "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        transition: "background-color 0.15s",
    }),
};

export default styles;
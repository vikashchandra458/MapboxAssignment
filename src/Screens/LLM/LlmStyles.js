import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    // Base / Header Styles
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },

    header: {
        backgroundColor: '#2E7D32',
        padding: 16,
    },

    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },

    headerText: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: '700',
        marginLeft: 10,
    },

    modelCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 15,
        marginTop: 12,
    },

    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 10,
        paddingHorizontal: 12,
        backgroundColor: '#FFFFFF',
        marginBottom: 12,
    },

    input: {
        flex: 1,
        color: '#111827',
        paddingVertical: 10,
        marginLeft: 10,
    },

    actionButton: {
        height: 40,
        backgroundColor: '#2E7D32',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        marginTop: 10,
    },

    actionText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
        marginLeft: 8,
    },

    // Download / Upload Progress Styles
    downloadContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
        backgroundColor: '#F5F7FA',
    },

    downloadTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 10,
    },

    downloadDescription: {
        textAlign: 'center',
        fontSize: 15,
        lineHeight: 22,
        color: '#6B7280',
        marginBottom: 24,
    },

    downloadButton: {
        backgroundColor: '#2E7D32',
        borderRadius: 12,
        paddingHorizontal: 28,
        paddingVertical: 14,
        marginTop: 16,
    },

    downloadButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },

    progressContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
    },

    progressPercent: {
        marginTop: 20,
        fontSize: 32,
        fontWeight: '700',
        color: '#2E7D32',
    },

    progressSize: {
        marginTop: 8,
        fontSize: 15,
        color: '#6B7280',
    },

    progressBar: {
        width: '100%',
        height: 10,
        borderRadius: 10,
        backgroundColor: '#E5E7EB',
        overflow: 'hidden',
        marginTop: 24,
    },

    progressFill: {
        height: '100%',
        backgroundColor: '#2E7D32',
        borderRadius: 10,
    },

    progressTrack: {
        width: '100%',
        height: 8,
        backgroundColor: '#E5E7EB',
        borderRadius: 8,
        overflow: 'hidden',
        marginTop: 20,
    },

    progressIndicator: {
        width: '35%',
        height: '100%',
        borderRadius: 8,
        backgroundColor: '#2E7D32',
    },

    //Common / Chat / Thinking Styles
    bubble: {
        padding: 15,
        borderRadius: 15,
        marginBottom: 10,
        maxWidth: '85%',
    },

    userBubble: {
        alignSelf: 'flex-end',
        backgroundColor: '#81C784',
    },

    botBubble: {
        alignSelf: 'flex-start',
        backgroundColor: '#FFFFFF',
    },

    title: {
        fontWeight: '700',
        fontSize: 15,
        marginBottom: 6,
        color: '#222',
    },

    loading: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 8,
    },

    inputBar: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#FFFFFF',
    },

    input2: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 10,
        paddingHorizontal: 12,
        maxHeight: 120,
        color: '#222',
        backgroundColor: '#FFFFFF',
    },

    send: {
        backgroundColor: '#2E7D32',
        paddingHorizontal: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        marginLeft: 10,
    },

    thinkingContainer: {
        paddingHorizontal: 8,
        paddingVertical: 8,
    },

    thinkingCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },

    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#E8F5E9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },

    avatarText: {
        fontSize: 24,
    },

    thinkingTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#222',
    },

    thinkingSubtitle: {
        fontSize: 13,
        color: '#6B7280',
        marginTop: 3,
    },

    progressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },

    progressText: {
        marginLeft: 10,
        fontWeight: '600',
        color: '#2E7D32',
    },

    systemContainer: {
        alignItems: 'center',
        marginVertical: 12,
    },

    systemBubble: {
        backgroundColor: '#E8F5E9',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        maxWidth: '90%',
    },

    systemText: {
        color: '#2E7D32',
        fontWeight: '600',
        textAlign: 'center',
        fontSize: 14,
    },
    //Whisper
    whisperContainer: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },

    topControls: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 10,
    },

    modeChip: {
        flex: 1,
        height: 30,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#0F766E',
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 4,
    },

    modeChipActive: {
        backgroundColor: '#0F766E',
    },

    modeChipText: {
        marginLeft: 8,
        fontSize: 16,
        fontWeight: '600',
        color: '#0F766E',
    },

    modeChipTextActive: {
        color: '#FFFFFF',
    },

    transcriptContainer: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        marginHorizontal: 16,
        marginBottom: 12,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        paddingHorizontal: 18,
        paddingTop: 18,
        paddingBottom: 10,
    },

    transcriptHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
    },

    transcriptTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111827',
    },

    transcriptScroll: {
        flex: 1,
    },

    transcriptContent: {
        flexGrow: 1,
        paddingBottom: 24,
    },

    transcript: {
        fontSize: 17,
        color: '#1F2937',
        lineHeight: 28,
    },

    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
    },

    emptyTitle: {
        marginTop: 16,
        fontSize: 17,
        fontWeight: '600',
        color: '#64748B',
    },

    emptySubtitle: {
        marginTop: 6,
        fontSize: 14,
        textAlign: 'center',
        color: '#94A3B8',
    },

    bottomBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },

    iconButton: {
        width: 52,
        height: 40,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },

    recordButton: {
        flex: 1,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#0F766E',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },

    stopButton: {
        backgroundColor: '#DC2626',
    },

    recordText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '700',
        marginLeft: 8,
    },
    emptyText: {
        marginTop: 30,
        fontSize: 17,
        lineHeight: 26,
        color: '#94A3B8',
        textAlign: 'center',
        paddingHorizontal: 24,
    },
});

export default styles;

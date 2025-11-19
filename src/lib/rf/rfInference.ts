// --- 1. DEFINISI INTERFACE UNTUK STRUKTUR MODEL ---

/**
 * Interface untuk node pemisah (split node) atau leaf node.
 */
interface TreeNode {
    id: number;
    type: 'split' | 'leaf';
    left?: TreeNode;
    right?: TreeNode;
    
    // Properti khusus SPLIT node
    feature?: 'Suhu_C' | 'Kelembapan_Persen';
    threshold?: number;

    // Properti khusus LEAF node
    value?: number[]; // Hitungan suara (e.g., [count_hujan, count_tidak_hujan])
    prediction?: string; // Label prediksi akhir (e.g., 'Hujan')
}

/**
 * Interface untuk seluruh struktur model Random Forest yang dimuat dari JSON.
 */
export interface RFModelStructure {
    model_type: string;
    n_estimators: number;
    classes: string[];
    features: string[];
    trees: TreeNode[];
}

// --- 2. LOGIKA INFERENSI ---

/**
 * Melakukan traversal (penelusuran) pada satu Decision Tree dari model JSON.
 * Logika ini meniru bagaimana Scikit-learn Decision Tree membuat keputusan.
 * @param tree Struktur satu pohon.
 * @param features Objek fitur input: {Suhu_C: value, Kelembapan_Persen: value}.
 * @returns Label prediksi akhir (e.g., 'Hujan' atau 'Tidak Hujan').
 */
function traverseTree(tree: TreeNode, features: { [key: string]: number }): string {
    let node = tree;
    
    // Lanjutkan selama node adalah node pemisah (split node)
    while (node.type === 'split' && node.left && node.right) {
        // Ambil nilai fitur berdasarkan nama fitur pemisah
        const featureValue = features[node.feature!];
        
        // Cek kondisi pemisah (Jika nilai fitur <= threshold, ikuti cabang kiri)
        if (featureValue <= node.threshold!) {
            node = node.left;
        } else {
            node = node.right;
        }
    }
    
    // Setelah loop selesai, node harus menjadi leaf node
    return node.prediction!;
}

/**
 * Menjalankan seluruh model Random Forest dengan mengumpulkan suara (voting) dari setiap pohon.
 * @param rfModel Struktur model Random Forest yang dimuat.
 * @param suhu Nilai Suhu (°C).
 * @param kelembapan Nilai Kelembapan (%).
 * @returns Prediksi mayoritas ('Hujan' atau 'Tidak Hujan').
 */
export function predictRandomForest(rfModel: RFModelStructure, suhu: number, kelembapan: number): string {
    const features = {
        'Suhu_C': suhu,
        'Kelembapan_Persen': kelembapan
    };
    
    const votes: { [key: string]: number } = {};
    
    // 1. Kumpulkan suara dari setiap pohon
    for (const tree of rfModel.trees) {
        const prediction = traverseTree(tree, features);
        votes[prediction] = (votes[prediction] || 0) + 1;
    }
    
    // 2. Tentukan prediksi mayoritas (majority voting)
    let majorityPrediction: string = '';
    let maxVotes = -1;
    
    for (const [classLabel, count] of Object.entries(votes)) {
        if (count > maxVotes) {
            maxVotes = count;
            majorityPrediction = classLabel;
        }
    }
    
    return majorityPrediction;
}
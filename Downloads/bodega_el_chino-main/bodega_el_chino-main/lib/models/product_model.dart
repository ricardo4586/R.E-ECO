class Product {
  final int? id;
  final String barcode;
  final String name;
  final String? brand; // Cambiado a nullable
  final double price;
  final int stock;
  final String unit;
  final String? description;
  final String? imageUrl;
  final String status; // Cambiado a required
  final DateTime? updatedAt;

  Product({
    this.id,
    required this.barcode,
    required this.name,
    this.brand, // Ahora es opcional
    required this.price,
    required this.stock,
    required this.unit,
    this.description,
    this.imageUrl,
    required this.status, // Ahora es requerido
    this.updatedAt,
  });

  // Constructor desde JSON del backend
  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id_producto'],
      barcode: json['codigo_barras']?.toString() ?? '',
      name: json['nombre']?.toString() ?? 'Producto Sin Nombre',
      brand: json['marca']?.toString(), // Tu BD no tiene marca, será null
      price: (json['precio_unidad'] ?? 0.0).toDouble(),
      stock: (json['stock_actual'] ?? 0).toInt(),
      unit: json['unidad_medida']?.toString() ?? 'unidad',
      description: json['descripcion']?.toString(),
      imageUrl: json['url_imagen']?.toString(),
      status: json['estado']?.toString() ?? 'activo', // Ahora viene de la BD
      updatedAt: json['fecha_actualizacion'] != null
          ? DateTime.tryParse(json['fecha_actualizacion'])
          : null,
    );
  }

  // Convertir a JSON para enviar al backend
  Map<String, dynamic> toJson() {
    return {
      if (id != null) 'id_producto': id,
      'codigo_barras': barcode,
      'nombre': name,
      'precio_unidad': price,
      'stock_actual': stock,
      'unidad_medida': unit,
      'descripcion': description,
      'url_imagen': imageUrl,
      'estado': status,
      // 'marca' no se incluye porque tu BD no tiene esa columna
    };
  }

  // Copiar con nuevos valores
  Product copyWith({
    int? id,
    String? barcode,
    String? name,
    String? brand,
    double? price,
    int? stock,
    String? unit,
    String? description,
    String? imageUrl,
    String? status,
    DateTime? updatedAt,
  }) {
    return Product(
      id: id ?? this.id,
      barcode: barcode ?? this.barcode,
      name: name ?? this.name,
      brand: brand ?? this.brand,
      price: price ?? this.price,
      stock: stock ?? this.stock,
      unit: unit ?? this.unit,
      description: description ?? this.description,
      imageUrl: imageUrl ?? this.imageUrl,
      status: status ?? this.status,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  String toString() {
    return 'Product($name, $barcode, S/.$price, Estado: $status)';
  }

  // Helper para ver si el producto está activo
  bool get isActive => status == 'activo';
  
  // Helper para ver si el producto está pendiente
  bool get isPending => status == 'pendiente';
}
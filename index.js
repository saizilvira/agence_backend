import express from 'express';
import { pool } from './db.js';
import bodyParser from 'body-parser';
import cors from 'cors';
const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())
app.get('/consultores', async (req, res) => {
    const [result] = await pool.query("select cu.co_usuario, cu.no_usuario from cao_usuario cu \
    inner join permissao_sistema ps on cu.co_usuario = ps.co_usuario \
    where ps.co_sistema = 1 \
    and ps.in_ativo = 'S' \
    and ps.co_tipo_usuario in (0,1,2);")
    res.json(result)
})
app.get('/periodos', async (req, res) => {
    const [result] = await pool.query("select \
    distinct concat(extract(year from cf.data_emissao),'-',extract(month from cf.data_emissao))  as periodo \
    from cao_fatura cf \
    inner join cao_os co on cf.co_os = co.co_os \
    inner join cao_salario cs on co.co_usuario = cs.co_usuario;")
    res.json(result)
})
app.post('/desempenho', async (req, res) => {
    var consultores = []
    let periodo = req.body.periodo.periodo
    for (const usuario of req.body.co_usuario) {
        const [result] = await pool.query("select \
                    cu.no_usuario, \
                    cf.data_emissao, \
                    concat(extract(year from cf.data_emissao),'-',extract(month from cf.data_emissao)) as periodo, \
                    cast(sum(cf.total - (cf.total * (cf.total_imp_inc / 100))) as decimal(10,2)) as receita_liquida, \
                    cs.brut_salario as custo_fixo, \
                    cast(sum(cf.valor - (cf.valor * (cf.total_imp_inc / 100))) * (cf.comissao_cn / 100)  as decimal(10,2)) as comissao, \
                    cast(sum(cf.valor - (cf.valor * (cf.total_imp_inc / 100))) - (cs.brut_salario + sum(cf.valor - (cf.valor * (cf.total_imp_inc / 100))) * (cf.comissao_cn / 100))  as decimal(10,2)) as lucro \
                    from cao_fatura cf \
                    inner join cao_os co on cf.co_os = co.co_os \
                    inner join cao_salario cs on co.co_usuario = cs.co_usuario \
                    inner join cao_usuario cu on co.co_usuario = cu.co_usuario  \
                    where co.co_usuario = ? \
                    and concat(extract(year from cf.data_emissao),'-',extract(month from cf.data_emissao)) = ? \
                    group by \
                    cu.no_usuario, \
                    cf.data_emissao, \
                    cs.brut_salario, \
                    cf.comissao_cn;", [usuario.co_usuario, periodo])
        if(result.length!==0){
            consultores.push(result)
        }
    }
    res.json(consultores)
})
app.listen(process.env.PORT || 3000)
